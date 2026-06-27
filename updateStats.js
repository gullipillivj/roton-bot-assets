let totalRuns = 0;
let totalProfit = 0;

function updateStats(investment, profit) {
  // Increment counters
  totalRuns++;
  totalProfit += profit;

  // Calculate average profit %
  let avgProfitPercent = (totalProfit / (investment * totalRuns)) * 100;

  // Update panel values
  document.getElementById("totalRuns").innerText = totalRuns;
  document.getElementById("totalProfit").innerText = totalProfit.toFixed(2);
  document.getElementById("avgProfit").innerText = avgProfitPercent.toFixed(2) + "%";
}
