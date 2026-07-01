function pickBestCoin() {
    const coins = ["BTC", "ETH", "BNB", "ADA"];
    const choice = coins[Math.floor(Math.random() * coins.length)];
    logToPanel("Coin evaluation complete, picked: " + choice);
    return choice;
}
window.pickBestCoin = pickBestCoin;
