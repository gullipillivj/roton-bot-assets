// main.js
const { debugLog, debugError } = require('./debug');
const { runBot } = require('./runbot');
const { wipeDailyTrend } = require('./trend');
const { wipeHistory } = require('./updateHistory');
const { config } = require('./config');

async function initBot(userId) {
    debugLog("main", `Initializing bot for user ${userId}`);

    try {
        // Daily reset check
        const today = new Date().toISOString().split("T")[0];
        if (config.lastRunDate !== today) {
            await wipeDailyTrend();
            await wipeHistory();
            config.lastRunDate = today;
            debugLog("main", "Daily reset completed", { date: today });
        }

        // Start trading cycles
        await runBot(userId);

        debugLog("main", "Bot run completed successfully");

    } catch (err) {
        debugError("main", err);
    }
}

module.exports = { initBot };
