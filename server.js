require("dotenv").config()
const express = require("express")
const cors = require("cors")

const healthRouter = require("./routes/health")
const productsRouter = require("./routes/products")
const purchasesRouter = require("./routes/purchases")
const salesRouter = require("./routes/sales")
const metricsRouter = require("./routes/metrics")

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
)
app.use(express.json())

// Request logger
app.use((req, res, next) => {
  const start = Date.now()
  res.on("finish", () => {
    const duration = Date.now() - start
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`)
  })
  next()
})

// Root greeting
app.get("/", (req, res) => {
  res.json({
    service: "BalanceBook Backend REST API",
    status: "running",
    version: "1.0.0",
    endpoints: [
      "/api/health",
      "/api/products",
      "/api/purchases",
      "/api/sales",
      "/api/metrics",
    ],
  })
})

// API Routes
app.use("/api/health", healthRouter)
app.use("/api/products", productsRouter)
app.use("/api/purchases", purchasesRouter)
app.use("/api/sales", salesRouter)
app.use("/api/metrics", metricsRouter)

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl}`,
  })
})

// Central Error Handler
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err)
  res.status(500).json({
    success: false,
    error: err.message || "Internal Server Error",
  })
})

// Start Server
app.listen(PORT, () => {
  console.log("==================================================")
  console.log(` BalanceBook Express Backend API`)
  console.log(` Running on port: http://localhost:${PORT}`)
  console.log(` Health check:    http://localhost:${PORT}/api/health`)
  console.log(` Products API:    http://localhost:${PORT}/api/products`)
  console.log(` Sales API:       http://localhost:${PORT}/api/sales`)
  console.log(` Purchases API:   http://localhost:${PORT}/api/purchases`)
  console.log(` Metrics API:     http://localhost:${PORT}/api/metrics`)
  console.log("==================================================")
})

module.exports = app
