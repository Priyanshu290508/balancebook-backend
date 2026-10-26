const express = require("express")
const router = express.Router()
const dbService = require("../services/dbService")

// GET /api/metrics
router.get("/", (req, res) => {
  try {
    const metrics = dbService.getMetrics()
    res.json({ success: true, data: metrics })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

module.exports = router
