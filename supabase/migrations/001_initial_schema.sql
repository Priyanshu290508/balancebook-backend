-- =================================================================
-- DUKAN KHATA (किराना दुकान खाता) — Supabase PostgreSQL Schema & Triggers
-- Architecture: architecture.md
-- Rules: rules.md (Business logic in DB triggers, no float money, no negative stock)
-- =================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    unit TEXT NOT NULL CHECK (unit IN ('kg', 'g', 'L', 'ml', 'pcs', 'packet')),
    sell_price NUMERIC(12,2) NOT NULL CHECK (sell_price >= 0),
    avg_cost NUMERIC(12,4) NOT NULL DEFAULT 0.0000 CHECK (avg_cost >= 0),
    stock_qty NUMERIC(12,3) NOT NULL DEFAULT 0.000 CHECK (stock_qty >= 0),
    low_stock_limit NUMERIC(12,3) NOT NULL DEFAULT 5.000 CHECK (low_stock_limit >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_product_name UNIQUE (user_id, name)
);

-- 3. PURCHASES TABLE (Maal Kharida)
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    supplier TEXT,
    qty NUMERIC(12,3) NOT NULL CHECK (qty > 0),
    cost_per_unit NUMERIC(12,2) NOT NULL CHECK (cost_per_unit >= 0),
    total_cost NUMERIC(14,2) GENERATED ALWAYS AS (ROUND(qty * cost_per_unit, 2)) STORED,
    purchased_at DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SALES TABLE (Bikri)
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    qty NUMERIC(12,3) NOT NULL CHECK (qty > 0),
    sell_per_unit NUMERIC(12,2) NOT NULL CHECK (sell_per_unit >= 0),
    cost_at_sale NUMERIC(12,4) NOT NULL DEFAULT 0.0000, -- Snapshot of avg_cost at time of sale
    total_sale NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    profit NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    sold_at DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =================================================================
-- DATABASE TRIGGERS (CORE BUSINESS LOGIC)
-- =================================================================

-- TRIGGER 1: After Purchase Insert -> Update Stock & Weighted Average Cost
CREATE OR REPLACE FUNCTION public.fn_process_purchase()
RETURNS TRIGGER AS $$
DECLARE
    curr_stock NUMERIC(12,3);
    curr_avg NUMERIC(12,4);
    new_stock NUMERIC(12,3);
    new_avg NUMERIC(12,4);
BEGIN
    SELECT stock_qty, avg_cost INTO curr_stock, curr_avg
    FROM public.products
    WHERE id = NEW.product_id
    FOR UPDATE;

    new_stock := curr_stock + NEW.qty;

    IF curr_stock <= 0 THEN
        new_avg := NEW.cost_per_unit;
    ELSE
        new_avg := ((curr_stock * curr_avg) + (NEW.qty * NEW.cost_per_unit)) / new_stock;
    END IF;

    UPDATE public.products
    SET stock_qty = new_stock,
        avg_cost = ROUND(new_avg, 4)
    WHERE id = NEW.product_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_after_purchase_insert
AFTER INSERT ON public.purchases
FOR EACH ROW EXECUTE FUNCTION public.fn_process_purchase();

-- TRIGGER 2: Before Sale Insert -> Validate Stock, Take Snapshot of Cost, Calculate Profit
CREATE OR REPLACE FUNCTION public.fn_validate_and_snapshot_sale()
RETURNS TRIGGER AS $$
DECLARE
    curr_stock NUMERIC(12,3);
    curr_avg NUMERIC(12,4);
BEGIN
    SELECT stock_qty, avg_cost INTO curr_stock, curr_avg
    FROM public.products
    WHERE id = NEW.product_id
    FOR UPDATE;

    IF curr_stock < NEW.qty THEN
        RAISE EXCEPTION 'स्टॉक पर्याप्त नहीं है (Insufficient stock). उपलब्ध: %, मांग: %', curr_stock, NEW.qty;
    END IF;

    NEW.cost_at_sale := curr_avg;
    NEW.total_sale := ROUND(NEW.qty * NEW.sell_per_unit, 2);
    NEW.profit := ROUND((NEW.sell_per_unit - curr_avg) * NEW.qty, 2);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_before_sale_insert
BEFORE INSERT ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.fn_validate_and_snapshot_sale();

-- TRIGGER 3: After Sale Insert -> Deduct Stock
CREATE OR REPLACE FUNCTION public.fn_deduct_sale_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.products
    SET stock_qty = stock_qty - NEW.qty
    WHERE id = NEW.product_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_after_sale_insert
AFTER INSERT ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.fn_deduct_sale_stock();

-- TRIGGER 4: After Sale Delete -> Revert Stock
CREATE OR REPLACE FUNCTION public.fn_revert_sale_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.products
    SET stock_qty = stock_qty + OLD.qty
    WHERE id = OLD.product_id;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_after_sale_delete
AFTER DELETE ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.fn_revert_sale_stock();

-- =================================================================
-- VIEWS
-- =================================================================

-- View 1: Product Margins
CREATE OR REPLACE VIEW public.v_product_margin AS
SELECT 
    p.id,
    p.user_id,
    p.name,
    p.category,
    p.unit,
    p.stock_qty,
    p.avg_cost,
    p.sell_price,
    ROUND(p.sell_price - p.avg_cost, 2) AS margin_amount,
    CASE 
        WHEN p.avg_cost > 0 THEN ROUND(((p.sell_price - p.avg_cost) / p.avg_cost) * 100, 2)
        ELSE 0.00
    END AS margin_pct,
    p.low_stock_limit,
    (p.stock_qty <= p.low_stock_limit) AS is_low_stock
FROM public.products p
WHERE p.is_active = TRUE;

-- View 2: Daily Summary
CREATE OR REPLACE VIEW public.v_daily_summary AS
SELECT 
    s.user_id,
    s.sold_at AS summary_date,
    COALESCE(SUM(s.total_sale), 0.00) AS total_sales,
    COALESCE(SUM(s.profit), 0.00) AS total_profit,
    COUNT(s.id) AS sales_count
FROM public.sales s
GROUP BY s.user_id, s.sold_at;

-- View 3: Low Stock Alert View
CREATE OR REPLACE VIEW public.v_low_stock AS
SELECT 
    p.id,
    p.user_id,
    p.name,
    p.category,
    p.unit,
    p.stock_qty,
    p.low_stock_limit
FROM public.products p
WHERE p.is_active = TRUE AND p.stock_qty <= p.low_stock_limit;

-- =================================================================
-- ROW LEVEL SECURITY (RLS)
-- =================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own products"
    ON public.products FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own purchases"
    ON public.purchases FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sales"
    ON public.sales FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.products, public.purchases, public.sales;
