async function initBot(userId) {
    try {
        const startBalance = parseFloat(document.getElementById("startBalance").value);
        const investBalance = parseFloat(document.getElementById("investBalance").value);
        const profitTarget = parseFloat(document.getElementById("profitTarget").value);
        const stopLoss = parseFloat(document.getElementById("stopLoss").value);

        console.log("[BOT INIT]", { startBalance, investBalance, profitTarget, stopLoss });

        // Daily reset check
        const today = new Date().toISOString().split("T")[0];
        if (config.lastRunDate !== today) {
            await wipeDailyTrend();
            await wipeHistory();
            config.lastRunDate = today;
        }

        // Start trading cycles
        await runBot(userId, startBalance, investBalance, profitTarget, stopLoss);

    } catch (err) {
        console.error("[BOT ERROR]", err);
    }
}
function logToPanel(msg) {
    const panel = document.getElementById("logPanel");
    if (panel) {
        panel.value += msg + "\n";
        panel.scrollTop = panel.scrollHeight;
    }
}

window.initBot = initBot;
window.logToPanel = logToPanel;
