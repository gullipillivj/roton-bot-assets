// main.js

async function initBot(userId) {
    debugLog("main", `Initializing bot for user ${userId}`);

    try {
        const today = new Date().toISOString().split("T")[0];
        if (controls.lastRunDate !== today) {
            await wipeDailyTrend();
            await wipeHistory();
            controls.lastRunDate = today;
            debugLog("main", "Daily reset completed", { date: today });
        }

        await runBot(userId);

        debugLog("main", "Bot run completed successfully");
    } catch (err) {
        debugError("main", err);
    }
}

// Attach to browser global instead of Node exports
window.initBot = initBot;
