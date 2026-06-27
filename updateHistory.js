function updateHistory(investment, profit, reason) {
  let tbody = document.querySelector("#historyTable tbody");
  let now = new Date().toLocaleString();

  tbody.innerHTML += `<tr>
    <td>${now}</td>
    <td>${investment.toFixed(2)}</td>
    <td>${profit.toFixed(2)}</td>
    <td>${reason}</td>
  </tr>`;
}
