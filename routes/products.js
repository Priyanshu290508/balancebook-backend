const express = require("express")
const router = express.Router()
const dbService = require("../services/dbService")

// GET /api/products
router.get("/", (req, res) => {
  try {
    const products = dbService.getProducts()
    res.json({ success: true, data: products })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET /api/products/:id
router.get("/:id", (req, res) => {
  try {
    const product = dbService.getProductById(req.params.id)
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" })
    }
    res.json({ success: true, data: product })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// POST /api/products
router.post("/", (req, res) => {
  try {
    const { name, category, unit, sell_price, avg_cost, stock_qty, low_stock_limit } = req.body
    if (!name || !category || !unit || sell_price === undefined) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: name, category, unit, sell_price",
      })
    }
    const newProduct = dbService.createProduct({
      name,
      category,
      unit,
      sell_price,
      avg_cost,
      stock_qty,
      low_stock_limit,
    })
    res.status(201).json({ success: true, data: newProduct })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// PUT /api/products/:id
router.put("/:id", (req, res) => {
  try {
    const updated = dbService.updateProduct(req.params.id, req.body)
    if (!updated) {
      return res.status(404).json({ success: false, error: "Product not found" })
    }
    res.json({ success: true, data: updated })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// DELETE /api/products/:id
router.delete("/:id", (req, res) => {
  try {
    const deleted = dbService.deleteProduct(req.params.id)
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Product not found" })
    }
    res.json({ success: true, message: "Product deleted" })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

module.exports = router
