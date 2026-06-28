// trading.js — trading loop with debug logs

// Global state variables
var running = false;
var runNumber = 0;
var position = null;        // start with no position
var investment = 500;       // or read from UI later
var profitTarget = 1;       // %
var stopLoss = 0.5;         // %
var profit = 0;
var balance = 1000;         // starting balance
var fees = 0;
var hopCount = 0;
var startTime = Date.now();
var holdStart = null;

// Trading loop
async function tradingLoop(runNumber) {
    logMessage("[DEBUG] tradingLoop entered, Run=" + runNumber);

    const symbols = ["BTCUSDT","ETHUSDT","BNBUSDT","ADAUSDT","LINKUSDT"];

    while (running) {
        try {
            if (position === null) {
                logMessage("[DEBUG] No position, picking best coin...");
                const bestCoin = await pickBestCoin(symbols);

                if (bestCoin) {
                    const qty = investment / bestCoin.price;
                    position = { symbol: bestCoin.symbol, price: bestCoin.price, qty: qty };
                    holdStart = Date.now();
                    showTrend(bestCoin.change24h);
                    logMessage("[DEBUG] Bought " + bestCoin.symbol + " at " + bestCoin.price +
                               " | Qty: " + qty.toFixed(6));
                    updateCurrentValue(bestCoin.price, position);
                } else {
                    logMessage("[DEBUG] No coin selected, retrying...");
                }

            } else if (position && position.symbol) {
                logMessage("[DEBUG] Checking current price for " + position.symbol);
                const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${position.symbol}`);
                const data = await res.json();
                const currentPrice = parseFloat(data.price);
                updateCurrentValue(currentPrice, position);

                if (currentPrice > position.price * (1 + profitTarget/100)) {
                    const tradeProfit = (currentPrice - position.price) * position.qty;
                    profit += tradeProfit;
                    balance += tradeProfit;
                    logMessage("[DEBUG] Profit target hit! Sold " + position.symbol +
                               " at " + currentPrice + " | Profit: " + tradeProfit.toFixed(2));
                    position = null;
                    holdStart = null;
                } else {
                    logMessage("[DEBUG] Holding " + position.symbol + " at " + currentPrice.toFixed(2));
                }

                // Stop conditions
                if (profit > 0 && fees >= profit) {
                    logMessage("[DEBUG] Fees exceeded profit. Stopping bot.");
                    stopBot(runNumber);
                    break;
                }
                if (hopCount >= 12) {
                    logMessage("[DEBUG] Hop limit reached. Stopping bot.");
                    stopBot(runNumber);
                    break;
                }
                if (Date.now() - startTime >= 2700000) {
                    logMessage("[DEBUG] Max runtime reached. Stopping bot.");
                    stopBot(runNumber);
                    break;
                }
            }
        } catch (err) {
            logMessage("[DEBUG] Error in tradingLoop: " + err);
        }

        // Wait 15 seconds before next iteration
        await new Promise(r => setTimeout(r, 15000));
        logMessage("[DEBUG] Loop iteration complete, Run=" + runNumber);
    }
}
