// main.js

const { runBot } = './runbot';
const { wipeDailyTrend } = './trend';
const { wipeHistory } = './updateHistory';
const { config } = './config';

async function initBot(userId) {
    console.log("function name from", "initBot");
   //

    try {
        // Daily reset check
        
        const today = new          
        Date().toISOString().split("T")[0];
        if (config.lastRunDate !== today) {
            await wipeDailyTrend();
            await wipeHistory();
            config.lastRunDate = today;
             completed", { date: today });
        }

        // Start trading cycles
        await simulateCycle(userId, 1);

        

    } catch (err) {
        
    }
}


window.initBot = initBot;
