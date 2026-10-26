/**
 * Core retail arithmetic services for BalanceBook
 */

/**
 * Calculates new weighted average cost and updated stock after a purchase
 * new_avg = (old_stock * old_avg + new_qty * new_cost) / (old_stock + new_qty)
 */
function calculateWeightedAverage(currentStock, currentAvgCost, newQty, newUnitCost) {
  const oldStock = Math.max(0, Number(currentStock) || 0)
  const oldAvg = Math.max(0, Number(currentAvgCost) || 0)
  const qty = Math.max(0, Number(newQty) || 0)
  const cost = Math.max(0, Number(newUnitCost) || 0)

  const newStock = oldStock + qty
  if (newStock === 0) {
    return { newStock: 0, newAvgCost: 0 }
  }

  const totalValue = oldStock * oldAvg + qty * cost
  const rawAvg = totalValue / newStock
  const newAvgCost = Math.round(rawAvg * 100) / 100

  return { newStock, newAvgCost }
}

/**
 * Calculates sale revenue and profit based on cost at time of sale
 * profit = (sell_per_unit - cost_at_sale) * qty
 */
function calculateSaleProfit(qty, sellPerUnit, costAtSale) {
  const quantity = Math.max(0, Number(qty) || 0)
  const sellRate = Math.max(0, Number(sellPerUnit) || 0)
  const costRate = Math.max(0, Number(costAtSale) || 0)

  const totalSale = Math.round(quantity * sellRate * 100) / 100
  const totalCost = Math.round(quantity * costRate * 100) / 100
  const profit = Math.round((totalSale - totalCost) * 100) / 100

  return { totalSale, totalCost, profit }
}

/**
 * Calculates gross margin percentage
 */
function calculateMargin(sellPrice, avgCost) {
  const sell = Number(sellPrice) || 0
  const cost = Number(avgCost) || 0
  const margin = Math.round((sell - cost) * 100) / 100
  const marginPct = cost > 0 ? Math.round(((sell - cost) / cost) * 1000) / 10 : 0

  return { margin, marginPct }
}

module.exports = {
  calculateWeightedAverage,
  calculateSaleProfit,
  calculateMargin,
}
