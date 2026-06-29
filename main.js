// main.js
const { debugLog, debugError } = './debug';
const { runBot } = './runbot';
const { wipeDailyTrend } = './trend';
const { wipeHistory } = './updateHistory';
const { config } = './config';

async function initBot(userId) {
    console.log("function name from", "initBot");
    debugLog("main", `Initializing bot for user ${userId}`);

    try {
        // Daily reset check
        console.log("function name from", "initBot");
        const today = new Date().toISOString().split("T")[0];
        if (config.lastRunDate !== today) {
            await wipeDailyTrend();
            await wipeHistory();
            config.lastRunDate = today;
            debugLog("main", "Daily reset completed", { date: today });
        }

        // Start trading cycles
        await simulateCycle(userId, 1);

        debugLog("main", "Bot run completed successfully");

    } catch (err) {
        debugError("main", err);
    }
}


window.initBot = initBot;
