async function runBot(userId) {
  debugLog("runbot", `Bot started for user ${userId}`);

  try {
    const balance = { entryPrice: null, totalProfit: 0 };

    for (let i = 0; i < 10 && controls.isRunning; i++) {
      debugLog("runbot", `Cycle ${i + 1} started`);
      const profit = await tradeCycle(userId, balance, controls.profitTarget, controls.stopLoss);
      balance.totalProfit += profit;
      debugLog("runbot", `Cycle ${i + 1} finished | Profit: ${profit.toFixed(2)}%`);
      await sleep(2000);
    }

    debugLog("runbot", `Bot completed | Total Profit: ${balance.totalProfit.toFixed(2)}%`);
  } catch (err) {
    debugError("runbot", err);
  }
}
