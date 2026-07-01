let botRunning = false;

function initBot(cycles) {
    botRunning = true;
    logToPanel("Bot started with " + cycles + " cycles");
    for (let i = 1; i <= cycles; i++) {
        if (!botRunning) {
            logToPanel("Bot stopped at cycle " + i);
            return;
        }
        logToPanel("Running cycle " + i);
        simulateCycle(i);
    }
    logToPanel("Bot finished");
}

function stopBot() {
    botRunning = false;
    logToPanel("Stop signal received");
}

window.initBot = initBot;
window.stopBot = stopBot;
