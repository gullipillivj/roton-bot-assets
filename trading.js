const { debugLog } = require('./debug');
const { getCurrentPrice } = require('./coins');
const { simulateBuy, simulateSell } = require('./simulate');

async function tradeCycle(userId, balance, profitTarget, stopLoss) {
    const price = await getCurrentPrice("BTC");

    if (!balance.entryPrice) {
        balance.entryPrice = price;
        await simulateBuy(userId, price);
        debugLog("trade", `Bought at ${price}`);
        return 0;
    }

    const changePct = ((price - balance.entryPrice) / balance.entryPrice) * 100;

    if (changePct >= profitTarget) {
        await simulateSell(userId, price);
        debugLog("trade", `Profit target hit: ${changePct.toFixed(2)}%`);
        balance.entryPrice = null;
        return changePct;
    } else if (changePct <= -stopLoss) {
        await simulateSell(userId, price);
        debugLog("trade", `Stop loss triggered: ${changePct.toFixed(2)}%`);
        balance.entryPrice = null;
        return changePct;
    } else {
        debugLog("trade", `Holding position | Change: ${changePct.toFixed(2)}%`);
        return changePct;
    }
}


window.initBot = tradeCycle;
