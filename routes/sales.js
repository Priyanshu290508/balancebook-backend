const express = require("express")
const router = express.Router()
const dbService = require("../services/dbService")

// GET /api/sales
router.get("/", (req, res) => {
  try {
    const sales = dbService.getSales()
    res.json({ success: true, data: sales })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// POST /api/sales
router.post("/", (req, res) => {
  try {
    const { product_id, qty, sell_per_unit, sold_at } = req.body
    if (!product_id || qty === undefined || sell_per_unit === undefined) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: product_id, qty, sell_per_unit",
      })
    }
    const result = dbService.createSale({
      product_id,
      qty,
      sell_per_unit,
      sold_at,
    })
    res.status(201).json({
      success: true,
      data: result.sale,
      product: result.updatedProduct,
    })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// DELETE /api/sales/:id
router.delete("/:id", (req, res) => {
  try {
    const deleted = dbService.deleteSale(req.params.id)
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Sale record not found" })
    }
    res.json({ success: true, message: "Sale record deleted" })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

module.exports = router
