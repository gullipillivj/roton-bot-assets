// trend.js
const { debugLog, debugError } = require('./debug');
const firebase = require('./firebase'); // assume Firebase SDK wrapper

async function recordTrade(userId, date, profitLoss) {
    try {
        await firebase.add('user_trades', { userId, date, profitLoss });
        debugLog("trend", `Recorded trade for user ${userId}`, { date, profitLoss });
    } catch (err) {
        debugError("trend", err);
    }
}

async function computeTrend(date) {
    try {
        const trades = await firebase.getAll('user_trades', { date });
        const avg = trades.reduce((sum, t) => sum + t.profitLoss, 0) / trades.length;
        const trendState = avg > 0 ? "+" : "-";

        await firebase.set('daily_trend', { date, avgProfitLoss: avg, trendState });
        debugLog("trend", "Daily trend updated", { avg, trendState });

        return trendState;
    } catch (err) {
        debugError("trend", err);
        return null;
    }
}

async function wipeDailyTrend() {
    try {
        await firebase.clear('user_trades');
        await firebase.clear('daily_trend');
        debugLog("trend", "Daily trend tables wiped");
    } catch (err) {
        debugError("trend", err);
    }
}

module.exports = { recordTrade, computeTrend, wipeDailyTrend };
