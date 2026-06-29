// main-browser.js

// Assume debugLog, debugError, runBot, wipeDailyTrend, wipeHistory, config
// are already loaded by other scripts

async function initBot(userId) {
    debugLog("main", `Initializing bot for user ${userId}`);

    try {
        const today = new Date().toISOString().split("T")[0];
        if (config.lastRunDate !== today) {
            await wipeDailyTrend();
            await wipeHistory();
            config.lastRunDate = today;
            debugLog("main", "Daily reset completed", { date: today });
        }

        await runBot(userId);
        debugLog("main", "Bot run completed successfully");
    } catch (err) {
        debugError("main", err);
    }
}

// Expose globally for HTML
window.initBot = initBot;
