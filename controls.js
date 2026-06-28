// controls.js — start/stop/exit button logic, validation, run counter
// Debug mode enabled

let runCounter = 0;

function startBot() {
    running = true;
    runCounter++;

    document.querySelector("button[onclick='startBot()']").disabled = true;
    document.querySelector("button[onclick='stopBot()']").disabled = false;
    document.querySelector("button[onclick='exitBot()']").disabled = false;

    balance = parseFloat(document.getElementById("balance").value) || 1000;
    investment = parseFloat(document.getElementById("investment").value) || 500;

    if (investment > balance) {
        logMessage("Error: Investment cannot exceed available balance.");
        running = false;
        document.querySelector("button[onclick='startBot()']").disabled = false;
        console.debug("[Controls] Invalid investment > balance");
        return;
    }

    profitTarget = parseFloat(document.getElementById("profitTarget").value) || 1;
    stopLoss = parseFloat(document.getElementById("stopLoss").value) || 0.5;
    profit = 0;
    position = null;
    holdStart = null;
    hopCount = 0;
    fees = 0;
    startTime = Date.now();

    document.getElementById("status").textContent = "Bot is running...";
    logMessage("Starting simulation with balance " + balance + " and investment " + investment);

    console.debug("[Controls] Bot started, Run:", runCounter, "Balance:", balance, "Investment:", investment);

    tradingLoop(runCounter);
}

function stopBot(runNumber) {
    running = false;
    document.querySelector("button[onclick='startBot()']").disabled = false;
    document.querySelector("button[onclick='stopBot()']").disabled = true;
    document.querySelector("button[onclick='exitBot()']").disabled = true;

    balance += profit;
    document.getElementById("status").textContent = "Bot stopped.";
    logMessage("Stopped. Final balance: " + balance.toFixed(2) +
               " | Net profit: " + profit.toFixed(2));

    addRunResult(runNumber, profit);

    console.debug("[Controls] Bot stopped, Run:", runNumber, "Profit:", profit, "Balance:", balance);
}

function exitBot() {
    running = false;
    document.querySelector("button[onclick='startBot()']").disabled = false;
    document.querySelector("button[onclick='stopBot()']").disabled = true;
    document.querySelector("button[onclick='exitBot()']").disabled = true;

    document.getElementById("status").textContent = "Exited to home.";
    logMessage("Exited simulation.");

    console.debug("[Controls] Bot exited");
}
