// coins.js

const BINANCE_API = "https://api.binance.com/api/v3";

// fetch all 24hr stats and filter rising coins
const getRisingCoins = async () => {
    try {
        const res = await fetch(`${BINANCE_API}/ticker/24hr`);
        const data = await res.json();

        // filter only USDT pairs with positive 24h change
        const rising = data.filter(item =>
            item.symbol.endsWith("USDT") &&
            parseFloat(item.priceChangePercent) > 0
        );

        // sort by % gain descending
        rising.sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent));

        // take top 10 rising coins
        const topCoins = rising.slice(0, 10).map(item => item.symbol);

        logToPanel(`[INFO] Rising coins selected: ${topCoins.join(", ")}`);
        return topCoins;
    } catch (err) {
        logToPanel(`[ERROR] Failed to fetch rising coins: ${err}`);
        // fallback to default 4 coins
        return ["BTCUSDT", "ETHUSDT", "ADAUSDT", "BNBUSDT"];
    }
};

// randomly pick one of the rising coins
const pickBestCoin = async () => {
    const coins = await getRisingCoins();
    const index = Math.floor(Math.random() * coins.length);
    return coins[index];
};

// evaluate coin value based on current price
const evaluateCoin = async (symbol, balance) => {
    try {
        const res = await fetch(`${BINANCE_API}/ticker/price?symbol=${symbol}`);
        const data = await res.json();
        const price = parseFloat(data.price);

        const quantity = balance / price;
        const currentValue = quantity * price;
        return currentValue;
    } catch (err) {
        logToPanel(`[ERROR] Failed to fetch price for ${symbol}: ${err}`);
        return balance;
    }
};
