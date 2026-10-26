const fs = require("fs")
const path = require("path")
const { calculateWeightedAverage, calculateSaleProfit } = require("./calcService")

const DB_DIR = path.join(__dirname, "..", "data")
const DB_FILE = path.join(DB_DIR, "balancebook_db.json")

const INITIAL_DATE = "2026-10-25"

const SEED_PRODUCTS = [
  {
    id: "p-1",
    name: "Basmati Rice",
    category: "Grains",
    unit: "kg",
    sell_price: 60.0,
    avg_cost: 48.0,
    stock_qty: 45.0,
    low_stock_limit: 10.0,
    is_active: true,
  },
  {
    id: "p-2",
    name: "Arhar Dal (Toor Dal)",
    category: "Pulses",
    unit: "kg",
    sell_price: 140.0,
    avg_cost: 115.0,
    stock_qty: 28.0,
    low_stock_limit: 8.0,
    is_active: true,
  },
  {
    id: "p-3",
    name: "Fortune Mustard Oil",
    category: "Cooking Oil",
    unit: "L",
    sell_price: 165.0,
    avg_cost: 142.0,
    stock_qty: 4.0,
    low_stock_limit: 6.0,
    is_active: true,
  },
  {
    id: "p-4",
    name: "Tata Salt 1kg",
    category: "Spices & Salt",
    unit: "packet",
    sell_price: 28.0,
    avg_cost: 22.5,
    stock_qty: 50.0,
    low_stock_limit: 15.0,
    is_active: true,
  },
  {
    id: "p-5",
    name: "Aashirvaad Atta 5kg",
    category: "Grains",
    unit: "packet",
    sell_price: 230.0,
    avg_cost: 195.0,
    stock_qty: 18.0,
    low_stock_limit: 5.0,
    is_active: true,
  },
  {
    id: "p-6",
    name: "Amul Taaza Milk 500ml",
    category: "Dairy",
    unit: "packet",
    sell_price: 27.0,
    avg_cost: 24.5,
    stock_qty: 12.0,
    low_stock_limit: 5.0,
    is_active: true,
  },
  {
    id: "p-7",
    name: "MDH Turmeric Powder 100g",
    category: "Spices",
    unit: "packet",
    sell_price: 38.0,
    avg_cost: 29.0,
    stock_qty: 22.0,
    low_stock_limit: 5.0,
    is_active: true,
  },
  {
    id: "p-8",
    name: "Sugar Regular",
    category: "Grocery",
    unit: "kg",
    sell_price: 44.0,
    avg_cost: 37.0,
    stock_qty: 85.0,
    low_stock_limit: 20.0,
    is_active: true,
  },
]

const SEED_PURCHASES = [
  {
    id: "pur-1",
    product_id: "p-1",
    product_name: "Basmati Rice",
    qty: 50,
    cost_per_unit: 48.0,
    total_cost: 2400.0,
    supplier: "Kisan Mandi",
    purchased_at: INITIAL_DATE,
    created_at: new Date().toISOString(),
  },
  {
    id: "pur-2",
    product_id: "p-2",
    product_name: "Arhar Dal (Toor Dal)",
    qty: 30,
    cost_per_unit: 115.0,
    total_cost: 3450.0,
    supplier: "Shree Ganesh Traders",
    purchased_at: INITIAL_DATE,
    created_at: new Date().toISOString(),
  },
  {
    id: "pur-3",
    product_id: "p-3",
    product_name: "Fortune Mustard Oil",
    qty: 10,
    cost_per_unit: 142.0,
    total_cost: 1420.0,
    supplier: "Adani Wilmar Dist.",
    purchased_at: INITIAL_DATE,
    created_at: new Date().toISOString(),
  },
  {
    id: "pur-4",
    product_id: "p-4",
    product_name: "Tata Salt 1kg",
    qty: 60,
    cost_per_unit: 22.5,
    total_cost: 1350.0,
    supplier: "Tata Consumer Dist.",
    purchased_at: INITIAL_DATE,
    created_at: new Date().toISOString(),
  },
  {
    id: "pur-5",
    product_id: "p-5",
    product_name: "Aashirvaad Atta 5kg",
    qty: 20,
    cost_per_unit: 195.0,
    total_cost: 3900.0,
    supplier: "ITC Wholesale Hub",
    purchased_at: INITIAL_DATE,
    created_at: new Date().toISOString(),
  },
]

const SEED_SALES = [
  {
    id: "sale-1",
    product_id: "p-1",
    product_name: "Basmati Rice",
    qty: 5,
    sell_per_unit: 60.0,
    cost_at_sale: 48.0,
    total_sale: 300.0,
    profit: 60.0,
    sold_at: INITIAL_DATE,
    created_at: new Date().toISOString(),
  },
  {
    id: "sale-2",
    product_id: "p-2",
    product_name: "Arhar Dal (Toor Dal)",
    qty: 2,
    sell_per_unit: 140.0,
    cost_at_sale: 115.0,
    total_sale: 280.0,
    profit: 50.0,
    sold_at: INITIAL_DATE,
    created_at: new Date().toISOString(),
  },
  {
    id: "sale-3",
    product_id: "p-3",
    product_name: "Fortune Mustard Oil",
    qty: 6,
    sell_per_unit: 165.0,
    cost_at_sale: 142.0,
    total_sale: 990.0,
    profit: 138.0,
    sold_at: INITIAL_DATE,
    created_at: new Date().toISOString(),
  },
  {
    id: "sale-4",
    product_id: "p-4",
    product_name: "Tata Salt 1kg",
    qty: 10,
    sell_per_unit: 28.0,
    cost_at_sale: 22.5,
    total_sale: 280.0,
    profit: 55.0,
    sold_at: INITIAL_DATE,
    created_at: new Date().toISOString(),
  },
  {
    id: "sale-5",
    product_id: "p-5",
    product_name: "Aashirvaad Atta 5kg",
    qty: 2,
    sell_per_unit: 230.0,
    cost_at_sale: 195.0,
    total_sale: 460.0,
    profit: 70.0,
    sold_at: INITIAL_DATE,
    created_at: new Date().toISOString(),
  },
]

function ensureDbFile() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true })
  }
  if (!fs.existsSync(DB_FILE)) {
    const initialDb = {
      products: SEED_PRODUCTS,
      purchases: SEED_PURCHASES,
      sales: SEED_SALES,
      updated_at: new Date().toISOString(),
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf-8")
    return initialDb
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8")
    const parsed = JSON.parse(raw)
    if (!parsed.products || parsed.products.length === 0) {
      parsed.products = SEED_PRODUCTS
      parsed.purchases = parsed.purchases || SEED_PURCHASES
      parsed.sales = parsed.sales || SEED_SALES
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), "utf-8")
    }
    return parsed
  } catch (err) {
    const freshDb = {
      products: SEED_PRODUCTS,
      purchases: SEED_PURCHASES,
      sales: SEED_SALES,
      updated_at: new Date().toISOString(),
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(freshDb, null, 2), "utf-8")
    return freshDb
  }
}

function writeDb(data) {
  data.updated_at = new Date().toISOString()
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8")
}

// PRODUCTS API
function getProducts() {
  const db = ensureDbFile()
  return db.products.filter((p) => p.is_active !== false)
}

function getProductById(id) {
  const db = ensureDbFile()
  return db.products.find((p) => p.id === id)
}

function createProduct(payload) {
  const db = ensureDbFile()
  const newProduct = {
    id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: payload.name.trim(),
    category: payload.category,
    unit: payload.unit,
    sell_price: Number(payload.sell_price),
    avg_cost: Number(payload.avg_cost) || 0,
    stock_qty: Number(payload.stock_qty) || 0,
    low_stock_limit: Number(payload.low_stock_limit) || 5,
    is_active: true,
  }
  db.products.push(newProduct)
  writeDb(db)
  return newProduct
}

function updateProduct(id, updates) {
  const db = ensureDbFile()
  const index = db.products.findIndex((p) => p.id === id)
  if (index === -1) return null

  db.products[index] = {
    ...db.products[index],
    ...updates,
    id: db.products[index].id,
  }
  writeDb(db)
  return db.products[index]
}

function deleteProduct(id) {
  const db = ensureDbFile()
  const index = db.products.findIndex((p) => p.id === id)
  if (index === -1) return false
  db.products[index].is_active = false
  writeDb(db)
  return true
}

// PURCHASES API (Weighted Average Calculation)
function getPurchases() {
  const db = ensureDbFile()
  return [...db.purchases].sort((a, b) => (b.purchased_at > a.purchased_at ? 1 : -1))
}

function createPurchase(payload) {
  const db = ensureDbFile()
  const product = db.products.find((p) => p.id === payload.product_id)
  if (!product) {
    throw new Error(`Product with ID "${payload.product_id}" not found`)
  }

  const qty = Number(payload.qty)
  const costPerUnit = Number(payload.cost_per_unit)
  const totalCost = Math.round(qty * costPerUnit * 100) / 100

  // Calculate weighted average
  const { newStock, newAvgCost } = calculateWeightedAverage(
    product.stock_qty,
    product.avg_cost,
    qty,
    costPerUnit
  )

  product.stock_qty = newStock
  product.avg_cost = newAvgCost

  const newPurchase = {
    id: `pur_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    product_id: product.id,
    product_name: product.name,
    qty,
    cost_per_unit: costPerUnit,
    total_cost: totalCost,
    supplier: payload.supplier?.trim() || "",
    purchased_at: payload.purchased_at || new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
  }

  db.purchases.push(newPurchase)
  writeDb(db)
  return { purchase: newPurchase, updatedProduct: product }
}

function deletePurchase(id) {
  const db = ensureDbFile()
  const index = db.purchases.findIndex((p) => p.id === id)
  if (index === -1) return false
  db.purchases.splice(index, 1)
  writeDb(db)
  return true
}

// SALES API (Validation for Zero Negative Stock & Profit Snapshot)
function getSales() {
  const db = ensureDbFile()
  return [...db.sales].sort((a, b) => (b.sold_at > a.sold_at ? 1 : -1))
}

function createSale(payload) {
  const db = ensureDbFile()
  const product = db.products.find((p) => p.id === payload.product_id)
  if (!product) {
    throw new Error(`Product with ID "${payload.product_id}" not found`)
  }

  const qty = Number(payload.qty)
  const sellPerUnit = Number(payload.sell_per_unit)

  if (product.stock_qty < qty) {
    throw new Error(
      `Insufficient stock for "${product.name}". Available: ${product.stock_qty} ${product.unit}, Requested: ${qty} ${product.unit}`
    )
  }

  const { totalSale, profit } = calculateSaleProfit(qty, sellPerUnit, product.avg_cost)

  // Decrement inventory stock
  product.stock_qty = Math.max(0, Math.round((product.stock_qty - qty) * 100) / 100)

  const newSale = {
    id: `sale_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    product_id: product.id,
    product_name: product.name,
    qty,
    sell_per_unit: sellPerUnit,
    cost_at_sale: product.avg_cost,
    total_sale: totalSale,
    profit,
    sold_at: payload.sold_at || new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
  }

  db.sales.push(newSale)
  writeDb(db)
  return { sale: newSale, updatedProduct: product }
}

function deleteSale(id) {
  const db = ensureDbFile()
  const index = db.sales.findIndex((s) => s.id === id)
  if (index === -1) return false
  db.sales.splice(index, 1)
  writeDb(db)
  return true
}

// METRICS & FINANCIAL ANALYTICS
function getMetrics() {
  const db = ensureDbFile()
  const todayStr = new Date().toISOString().split("T")[0]
  const currentMonth = todayStr.substring(0, 7)

  let todaySales = 0
  let todayPurchases = 0
  let todayProfit = 0
  let monthProfit = 0
  let totalInventoryCost = 0
  let totalRetailValue = 0

  db.sales.forEach((s) => {
    if (s.sold_at === todayStr) {
      todaySales += s.total_sale
      todayProfit += s.profit
    }
    if (s.sold_at && s.sold_at.startsWith(currentMonth)) {
      monthProfit += s.profit
    }
  })

  db.purchases.forEach((p) => {
    if (p.purchased_at === todayStr) {
      todayPurchases += p.total_cost
    }
  })

  const lowStockProducts = []
  db.products
    .filter((p) => p.is_active !== false)
    .forEach((p) => {
      totalInventoryCost += p.stock_qty * p.avg_cost
      totalRetailValue += p.stock_qty * p.sell_price
      if (p.stock_qty <= p.low_stock_limit) {
        lowStockProducts.push(p)
      }
    })

  const potentialProfit = Math.max(0, totalRetailValue - totalInventoryCost)
  const grossMarginPct =
    totalInventoryCost > 0
      ? ((potentialProfit / totalInventoryCost) * 100).toFixed(1)
      : "0.0"

  return {
    todaySales: Math.round(todaySales * 100) / 100,
    todayPurchases: Math.round(todayPurchases * 100) / 100,
    todayProfit: Math.round(todayProfit * 100) / 100,
    monthProfit: Math.round(monthProfit * 100) / 100,
    totalInventoryCost: Math.round(totalInventoryCost * 100) / 100,
    totalRetailValue: Math.round(totalRetailValue * 100) / 100,
    potentialProfit: Math.round(potentialProfit * 100) / 100,
    grossMarginPct,
    lowStockProducts,
    activeProductsCount: db.products.filter((p) => p.is_active !== false).length,
    totalSalesCount: db.sales.length,
    totalPurchasesCount: db.purchases.length,
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getPurchases,
  createPurchase,
  deletePurchase,
  getSales,
  createSale,
  deleteSale,
  getMetrics,
}
