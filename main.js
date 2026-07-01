// main.js

async function initBot(userId) {
     try {
        // Daily reset check
        const today = new Date().toISOString().split("T")[0];
        if (config.lastRunDate !== today) {
            await wipeDailyTrend();
            await wipeHistory();
            config.lastRunDate = today;
               }

        // Start trading cycles
        await runBot(userId);

         } catch (err) {
      
    }
}

window.initBot = initBot;
