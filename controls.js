function startBot() {
    logMessage("[DEBUG] StartBot clicked");
    document.getElementById("status").textContent = "[DEBUG] StartBot triggered";

    running = true;
    runCounter++;

    document.querySelector("button[onclick='startBot()']").disabled = true;
    document.querySelector("button[onclick='stopBot()']").disabled = false;
    document.querySelector("button[onclick='exitBot()']").disabled = false;

    balance = parseFloat(document.getElementById("balance").value) || 1000;
    investment = parseFloat(document.getElementById("investment").value) || 500;

    logMessage("[DEBUG] Balance=" + balance + " Investment=" + investment);

    if (investment > balance) {
        logMessage("[DEBUG] Error: Investment > Balance");
        running = false;
        document.querySelector("button[onclick='startBot()']").disabled = false;
        return;
    }

    profitTarget = parseFloat(document.getElementById("profitTarget").value) || 1;
    stopLoss = parseFloat(document.getElementById("stopLoss").value) || 0.5;
    profit = 0; position = null; holdStart = null; hopCount = 0; fees = 0; startTime = Date.now();

    document.getElementById("status").textContent = "Bot is running...";
    logMessage("[DEBUG] TradingLoop starting... Run=" + runCounter);

    tradingLoop(runCounter);
}
