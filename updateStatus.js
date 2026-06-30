// updateStatus.js

function updateStatus(message, data = null) {
    try {
        // Display message on UI (pseudo-code)
        document.getElementById("statusPanel").innerText = message;

        // Debug log for system + dev analysis
        debugLog("updateStatus", `UI message displayed: ${message}`, data);

    } catch (err) {
        debugError("updateStatus", err);
    }
}

function showTrend(trendState) {
    let message;
    if (trendState === "+") {
        message = "Market trend today: UP, Adjust your investment and profit parameters accordingly.";
    } else {
        message = "Market trend today: DOWN, Adjust your investment and profit parameters accordingly.";
    }

    updateStatus(message, { trendState });
}

function showProfitLoss(profitLoss) {
    const message = `Current Profit/Loss: ${(profitLoss * 100).toFixed(2)}%`;
    updateStatus(message, { profitLoss });
}

function showExit(reason) {
    const message = `Bot exited: ${reason}`;
    updateStatus(message, { reason });
}


