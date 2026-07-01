async function runBot(userId, startBalance, investBalance, profitTarget, stopLoss) {
    console.log("[BOT] runBot started for user:", userId);
    logToPanel("[BOT] runBot started");

    for (let i = 1; i <= 3; i++) {
        logToPanel(`[BOT] Starting cycle ${i}`);
        const profit = await simulateCycle(userId, i);
        logToPanel(`[BOT] Cycle ${i} profit: ${profit}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    logToPanel("[BOT] runBot finished");
}
