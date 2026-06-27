function updateStatus(activeValue, bufferValue, totalValue, investment, stopLoss) {
  // Update panel values
  document.getElementById("activeValue").innerText = activeValue.toFixed(2);
  document.getElementById("bufferValue").innerText = bufferValue.toFixed(2);
  document.getElementById("totalValue").innerText = totalValue.toFixed(2);

  // Calculate profit %
  let profitPercent = ((totalValue - investment) / investment) * 100;
  document.getElementById("profitPercent").innerText = profitPercent.toFixed(2) + "%";

  // Stop loss status
  if (totalValue <= investment * (1 - stopLoss)) {
    document.getElementById("stopLossStatus").innerText = "Triggered";
    document.getElementById("stopLossStatus").style.color = "red";
  } else {
    document.getElementById("stopLossStatus").innerText = "Safe";
    document.getElementById("stopLossStatus").style.color = "green";
  }
}
