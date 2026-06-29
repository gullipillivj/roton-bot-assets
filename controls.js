// controls.js

function startBot() {
    logMessage("[DEBUG] StartBot clicked");
    running = true;
    runNumber = 1;
    tradingLoop(runNumber);   // <-- critical call

    // Enable/disable buttons
    document.querySelector("button[onclick='startBot()']").disabled = true;
    document.querySelector("button[onclick='stopBot()']").disabled = false;
    document.querySelector("button[onclick='exitBot()']").disabled = false;
}

function stopBot() {
    logMessage("[DEBUG] StopBot clicked");
    running = false;

    // Enable/disable buttons
    document.querySelector("button[onclick='startBot()']").disabled = false;
    document.querySelector("button[onclick='stopBot()']").disabled = true;
    document.querySelector("button[onclick='exitBot()']").disabled = false;
}

function exitBot() {
    logMessage("[DEBUG] ExitBot clicked");
    running = false;

    // Reset buttons
    document.querySelector("button[onclick='startBot()']").disabled = false;
    document.querySelector("button[onclick='stopBot()']").disabled = true;
    document.querySelector("button[onclick='exitBot()']").disabled = true;

    // Clear log/status
    document.getElementById("status").textContent = "";
    document.getElementById("log").textContent = "--- Log Panel ---";
    document.getElementById("currentValue").textContent = "Current Value: -";
}
window.startBot = startBot;
window.stopBot = stopBot;
window.exitBot = exitBot;
