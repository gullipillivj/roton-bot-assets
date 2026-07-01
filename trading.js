
async function tradeCycle(userId, balance, profitTarget, stopLoss) {
    const price = await getCurrentPrice("BTC");

    if (!balance.entryPrice) {
        balance.entryPrice = price;
        await simulateBuy(userId, price);
        return 0;
    }

    const changePct = ((price - balance.entryPrice) / balance.entryPrice) * 100;

    if (changePct >= profitTarget) {
        await simulateSell(userId, price);
         balance.entryPrice = null;
        return changePct;
    } else if (changePct <= -stopLoss) {
        await simulateSell(userId, price);
         balance.entryPrice = null;
        return changePct;
    } else {
         return changePct;
    }
}


window.tradeCycle = tradeCycle;
