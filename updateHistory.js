// updateHistory.js

async function logTrade(userId, date, tradeData) {
    try {
        await firebase.add('trade_history', { userId, date, ...tradeData });
        } catch (err) {
        
    }
}

async function getHistory(date) {
    try {
        const history = await firebase.getAll('trade_history', { date });
          return history;
    } catch (err) {
        
        return [];
    }
}

async function wipeHistory() {
    try {
        await firebase.clear('trade_history');
         } catch (err) {
         }
}


