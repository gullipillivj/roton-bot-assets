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

    logToPanel(`Bot started with ${cycles} cycles`);
    logToPanel(`Parameters: Start=${window.controls.startBalance}, Invest=${window.controls.investBalance}, ProfitTarget=${window.controls.profitTarget}%, StopLoss=${window.controls.stopLoss}%`);

    for (let i = 1; i <= cycles; i++) {
        if (!botRunning) {
            logToPanel("Bot stopped at cycle " + i);
            return;
        }
        logToPanel("Running cycle " + i);
        await simulateCycle(i);   // ✅ wait for each cycle to finish
    }

    // ✅ Final summary after all cycles
    finalizeSummary();
}

function finalizeSummary() {
    const startBalance = window.controls.startBalance;
    const investBalance = window.controls.investBalance;

    const totalChange = investBalance - startBalance;
    const percentChange = (totalChange / startBalance) * 100;

    logToPanel("=======================================");
    logToPanel(`[SUMMARY] Bot run complete`);
    logToPanel(`[SUMMARY] Final Start Balance: ${startBalance.toFixed(2)} USDT`);
    logToPanel(`[SUMMARY] Final Investment Balance: ${investBalance.toFixed(2)} USDT`);
    logToPanel(`[SUMMARY] Net Change: ${totalChange.toFixed(2)} USDT (${percentChange.toFixed(2)}%)`);
    logToPanel("=======================================");
}
