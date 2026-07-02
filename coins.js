// coins.js

const BINANCE_API = "https://api.binance.com/api/v3";

const coins = ["BTCUSDT", "ETHUSDT", "ADAUSDT", "BNBUSDT"];

const pickBestCoin = async () => {
    const index = Math.floor(Math.random() * coins.length);
    return coins[index];
};

const evaluateCoin = async (symbol, balance) => {
    try {
        const res = await fetch(`${BINANCE_API}/ticker/price?symbol=${symbol}`);
        const data = await res.json();
        const price = parseFloat(data.price);

        const quantity = balance / price;
        const currentValue = quantity * price;
        return currentValue;
    } catch (err) {
        console.log(`[ERROR] Failed to fetch price for ${symbol}: ${err}`);
        return balance;
    }
};
