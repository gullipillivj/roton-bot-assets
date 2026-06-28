// updateHistory.js
const { debugLog, debugError } = require('./debug');
const firebase = require('./firebase'); // assume Firebase SDK wrapper

async function logTrade(userId, date, tradeData) {
    try {
        await firebase.add('trade_history', { userId, date, ...tradeData });
        debugLog("updateHistory", `Trade logged for user ${userId}`, tradeData);
    } catch (err) {
        debugError("updateHistory", err);
    }
}

async function getHistory(date) {
    try {
        const history = await firebase.getAll('trade_history', { date });
        debugLog("updateHistory", `Fetched history for ${date}`, history);
        return history;
    } catch (err) {
        debugError("updateHistory", err);
        return [];
    }
}

async function wipeHistory() {
    try {
        await firebase.clear('trade_history');
        debugLog("updateHistory", "Trade history wiped for new date");
    } catch (err) {
        debugError("updateHistory", err);
    }
}

module.exports = { logTrade, getHistory, wipeHistory };
