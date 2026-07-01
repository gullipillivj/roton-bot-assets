function simulateCycle(i) {
    logToPanel("Simulating cycle " + i);
    const coin = pickBestCoin();
    logToPanel("Best coin chosen: " + coin);
    runBot(coin);
}
window.simulateCycle = simulateCycle;
