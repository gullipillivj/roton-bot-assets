// trend.js

async function recordTrade(userId, date, profitLoss) {
    try {
        await firebase.add('user_trades', { userId, date, profitLoss });
        } catch (err) {
        
    }
}

async function computeTrend(date) {
    try {
        const trades = await firebase.getAll('user_trades', { date });
        const avg = trades.reduce((sum, t) => sum + t.profitLoss, 0) / trades.length;
        const trendState = avg > 0 ? "+" : "-";

        await firebase.set('daily_trend', { date, avgProfitLoss: avg, trendState });
            return trendState;
    } catch (err) {
        
        return null;
    }
}

async function wipeDailyTrend() {
    try {
        await firebase.clear('user_trades');
        await firebase.clear('daily_trend');
           } catch (err) {
        
    }
}

window.recordTrade = recordTrade;
window.computeTrend = computeTrend;
