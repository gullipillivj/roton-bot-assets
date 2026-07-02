function initBot(cycles) {
    botRunning = true;

    // Read values from HTML form and store in controls
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
        simulateCycle(i); // simulateCycle can now read from window.controls
    }

    logToPanel("Bot finished");
}
