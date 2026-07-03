let balanceHistory = []; // simulate.js will push values here

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
    balanceChart.data.datasets[0].data.push(balanceHistory[balanceHistory.length - 1]);
    balanceChart.update();
}
