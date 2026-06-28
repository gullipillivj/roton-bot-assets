// ui.js — handles log panel, current value, and profit chart
// Debug mode enabled

let profitChart = null;

function logMessage(msg) {
    const logDiv = document.getElementById("log");
    const now = new Date().toLocaleTimeString();
    logDiv.textContent += `\n[${now}] ${msg}`;
    logDiv.scrollTop = logDiv.scrollHeight;

    console.debug("[UI] LogMessage:", msg);
}

function updateCurrentValue(price, position) {
    if (position) {
        const val = position.qty * price;
        document.getElementById("currentValue").textContent =
            "Current Value: " + val.toFixed(2) + " USDT";

        console.debug("[UI] CurrentValue updated:", val.toFixed(2));
    }
}

function initChart() {
    const ctx = document.getElementById('profitChart').getContext('2d');
    profitChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Profit/Loss per Run (USDT)',
                data: [],
                backgroundColor: function(ctx) {
                    return ctx.raw >= 0 ? 'rgba(0, 153, 51, 0.6)' : 'rgba(204, 0, 0, 0.6)';
                }
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });

    console.debug("[UI] Chart initialized");
}

function addRunResult(runNumber, netProfit) {
    if (!profitChart) initChart();
    profitChart.data.labels.push("Run " + runNumber);
    profitChart.data.datasets[0].data.push(netProfit);
    profitChart.update();

    console.debug("[UI] RunResult added:", "Run", runNumber, "Profit", netProfit);
}
