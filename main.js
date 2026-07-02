// main.js

async function initBot(cycles) {
    botRunning = true;

    // Sync form values into controls.js
    window.controls.startBalance = parseFloat(document.getElementById("startBalance").value);
    window.controls.investBalance = parseFloat(document.getElementById("investBalance").value);
    window.controls.profitTarget = parseFloat(document.getElementById("profitTarget").value);
    window.controls.stopLoss = parseFloat(document.getElementById("stopLoss").value);
    window.controls.isRunning = true;
    window.controls.lastRunDate = new Date();

    for (let i = 1; i <= cycles; i++) {
        if (!botRunning) {
            return;
        }
        await simulateCycle(i);   // ✅ wait for simulate.js to finish each cycle
    }

    finalizeSummary();
}

function finalizeSummary() {
    const startBalance = window.controls.startBalance;
    const investBalance = window.controls.investBalance;

    const totalChange = investBalance - startBalance;
    const percentChange = (totalChange / startBalance) * 100;

    console.log("Bot run complete");
    console.log("Final Start Balance:", startBalance.toFixed(2), "USDT");
    console.log("Final Investment Balance:", investBalance.toFixed(2), "USDT");
    console.log("Net Change:", totalChange.toFixed(2), "USDT", `(${percentChange.toFixed(2)}%)`);
}
