async function runBot(userId, startBalance, investBalance, profitTarget, stopLoss) {
    console.log("[BOT] runBot started for user:", userId);

    // Minimal test loop: 3 cycles
    for (let i = 1; i <= 3; i++) {
        console.log(`[BOT] Starting cycle ${i}`);

        // Call your simulation logic
        await simulateCycles(startBalance, investBalance, profitTarget, stopLoss, i);

        // Wait 1 second between cycles
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log(`[BOT] Cycle ${i} completed`);
        const logPanel = document.getElementById("logPanel");
        if (logPanel) {
            logPanel.value += `[BOT] Cycle ${i} completed\n`;
            logPanel.scrollTop = logPanel.scrollHeight;
        }
    }

    console.log("[BOT] runBot finished");
}

window.runBot = runBot;
