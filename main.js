// main.js

async function initBot(userId) {
    console.log("function name from", "initBot");
    debugLog("main", `Initializing bot for user ${userId}`);

    const today = new Date().toISOString().split("T")[0];

    if (typeof config === "undefined") {
        console.log("Error: config not defined");
        return;
    }

    if (config.lastRunDate !== today) {
        if (typeof wipeDailyTrend === "function") {
            console.log("Calling wipeDailyTrend");
            await wipeDailyTrend();
        } else {
            console.log("Error: wipeDailyTrend not defined");
        }

        if (typeof wipeHistory === "function") {
            console.log("Calling wipeHistory");
            await wipeHistory();
        } else {
            console.log("Error: wipeHistory not defined");
        }

        config.lastRunDate = today;
        debugLog("main", "Daily reset completed", { date: today });
    }

    if (typeof simulateCycle === "function") {
        console.log("Calling simulateCycle");
        await simulateCycle(userId, 1);
    } else {
        console.log("Error: simulateCycle not defined");
    }

    debugLog("main", "Bot run completed successfully");
}
window.initBot = initBot;

window.initBot = initBot;
