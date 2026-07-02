// main.js

async function initBot(cycles) {
    // sync values from form into controls
    window.controls.startBalance = parseFloat(document.getElementById("startBalance").value);
    window.controls.investBalance = parseFloat(document.getElementById("investBalance").value);
    window.controls.profitTarget = parseFloat(document.getElementById("profitTarget").value);
    window.controls.stopLoss = parseFloat(document.getElementById("stopLoss").value);
    window.controls.lastRunDate = new Date();

    console.log("[INFO] Bot started at", window.controls.lastRunDate.toLocaleTimeString());

    for (let i = 1; i <= cycles; i++) {
        await simulateCycle(i);   // 🔗 simulate.js
    }

    finalizeSummary();
    console.log("[INFO] Bot finished");
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
