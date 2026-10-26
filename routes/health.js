const express = require("express")
const router = express.Router()

router.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "BalanceBook Backend API",
    engine: "Retail Ledger Engine v1.0",
    timestamp: new Date().toISOString(),
  })
})

module.exports = router
