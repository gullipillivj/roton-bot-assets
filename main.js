// main.js

// make sure controls exists
window.controls = {};

const ctx = document.getElementById('balanceChart').getContext('2d');
const balanceChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Investment Balance',
            data: [],
            borderColor: '#f3ba2f',
            backgroundColor: 'rgba(243,186,47,0.2)',
            fill: true,
            tension: 0.3
        }]
    },
    options: {
        responsive: true,
        plugins: { legend: { display: true } }
    }
});

function updateChart() {
    balanceChart.data.labels.push(`Cycle ${balanceChart.data.labels.length + 1}`);
    balanceChart.data.datasets[0].data.push(window.balanceHistory[window.balanceHistory.length - 1]);
    balanceChart.update();
}


async function initBot(cycles) {
    // sync values from form into controls
    window.controls.startBalance = parseFloat(document.getElementById("startBalance").value);
    window.controls.investBalance = parseFloat(document.getElementById("investBalance").value);
    window.controls.profitTarget = parseFloat(document.getElementById("profitTarget").value);
    window.controls.stopLoss = parseFloat(document.getElementById("stopLoss").value);
    window.controls.lastRunDate = new Date();

    logToPanel("[INFO] Bot started at " + window.controls.lastRunDate.toLocaleTimeString());

    for (let i = 1; i <= 10; i++) {
        await simulateCycle(i);   // 🔗 simulate.js
    }

    finalizeSummary();
    logToPanel("[INFO] Bot finished");
}

function finalizeSummary() {
    const startBalance = window.controls.startBalance;
    const investBalance = window.controls.investBalance;

    const totalChange = investBalance - startBalance;
    const percentChange = (totalChange / startBalance) * 100;

    logToPanel("Bot run complete");
    logToPanel("Final Start Balance: " + startBalance.toFixed(2) + " USDT");
    logToPanel("Final Investment Balance: " + investBalance.toFixed(2) + " USDT");
    logToPanel("Net Change: " + totalChange.toFixed(2) + " USDT (" + percentChange.toFixed(2) + "%)");
}

// expose functions to window so HTML buttons can call them
window.initBot = initBot;
window.stopBot = function() {
    logToPanel("[INFO] Bot stopped");
};
