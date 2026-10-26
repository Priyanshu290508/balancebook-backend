# BalanceBook Backend REST API

This is the standalone Node.js & Express REST API server for **BalanceBook**. It provides file-backed persistence, weighted-average purchase costing, sale profit margin snapshots, and real-time store metrics.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
The server will start on `http://localhost:5000`.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Healthcheck and server status |
| `GET` | `/api/products` | List all active inventory items |
| `GET` | `/api/products/:id` | Get details for a single product |
| `POST` | `/api/products` | Create a new inventory product |
| `PUT` | `/api/products/:id` | Update product prices or limits |
| `DELETE`| `/api/products/:id` | Deactivate/remove a product |
| `GET` | `/api/purchases` | List all inward stock deliveries |
| `POST` | `/api/purchases` | Record inward purchase (auto-recalculates weighted average cost & increases stock) |
| `DELETE`| `/api/purchases/:id` | Delete a purchase entry |
| `GET` | `/api/sales` | List all customer sales receipts |
| `POST` | `/api/sales` | Record a sale (validates zero negative stock, calculates profit & decrements stock) |
| `DELETE`| `/api/sales/:id` | Delete a sale entry |
| `GET` | `/api/metrics` | Returns today's sales, profit, monthly net, and valuation |

---

## Storage & Database
- Real-time file store: `data/balancebook_db.json`
- Optional PostgreSQL schema: `supabase/migrations/001_initial_schema.sql`
