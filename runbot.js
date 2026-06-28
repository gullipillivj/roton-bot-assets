// runbot.js
const { debugLog, debugError } = require('./debug');
const { simulateCycle } = require('./simulate');

async function runBot(userId) {
    debugLog("runbot", `Bot started for user ${userId}`);

    try {
        const profit = await simulateCycle(userId, 1);
        debugLog("runbot", `Cycle finished | Profit: ${profit}%`);

        if (profit >= 0.05) {
            debugLog("runbot", "Target profit achieved, exiting bot");
        } else {
            debugLog("runbot", "Target not reached, exiting with minimal result");
        }
    } catch (err) {
        debugError("runbot", err);
    }
}

module.exports = { runBot };
