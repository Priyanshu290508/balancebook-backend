const express = require("express")
const router = express.Router()
const dbService = require("../services/dbService")

// GET /api/purchases
router.get("/", (req, res) => {
  try {
    const purchases = dbService.getPurchases()
    res.json({ success: true, data: purchases })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// POST /api/purchases
router.post("/", (req, res) => {
  try {
    const { product_id, qty, cost_per_unit, supplier, purchased_at } = req.body
    if (!product_id || qty === undefined || cost_per_unit === undefined) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: product_id, qty, cost_per_unit",
      })
    }
    const result = dbService.createPurchase({
      product_id,
      qty,
      cost_per_unit,
      supplier,
      purchased_at,
    })
    res.status(201).json({
      success: true,
      data: result.purchase,
      product: result.updatedProduct,
    })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
})

// DELETE /api/purchases/:id
router.delete("/:id", (req, res) => {
  try {
    const deleted = dbService.deletePurchase(req.params.id)
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Purchase record not found" })
    }
    res.json({ success: true, message: "Purchase record deleted" })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

module.exports = router
