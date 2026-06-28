// trading.js — trading loop with debug logs

// Global state variables
var running = false;
var runNumber = 0;
var position = null;

// Read balances from UI inputs (fallback defaults if empty)
function initGlobals() {
    investment = parseFloat(document.getElementById("investmentBalance").value) || 500;
    balance = parseFloat(document.getElementById("startingBalance").value) || 1000;
    profitTarget = parseFloat(document.getElementById("profitTarget").value) || 1;
    stopLoss = parseFloat(document.getElementById("stopLoss").value) || 0.5;

    profit = 0;
    fees = 0;
    hopCount = 0;
    startTime = Date.now();
    holdStart = null;
}

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

                    // Apply buy fee (0.1%)
                    const buyFee = investment * 0.001;
                    fees += buyFee;
                    balance -= buyFee;

                    position = { symbol: bestCoin.symbol, price: bestCoin.price, qty: qty };
                    holdStart = Date.now();
                    showTrend(bestCoin.change24h);

                    logMessage("[DEBUG] Bought " + bestCoin.symbol + " at " + bestCoin.price +
                               " | Qty: " + qty.toFixed(6) +
                               " | Fee: " + buyFee.toFixed(2));
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

                    // Apply sell fee (0.1%)
                    const sellFee = (currentPrice * position.qty) * 0.001;
                    fees += sellFee;

                    balance += tradeProfit - sellFee;
                    profit += tradeProfit - sellFee;

                    logMessage("[DEBUG] Profit target hit! Sold " + position.symbol +
                               " at " + currentPrice +
                               " | Profit: " + (tradeProfit - sellFee).toFixed(2) +
                               " | Fee: " + sellFee.toFixed(2));

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
                if (hopCount > 0 && hopCount >= 12) {
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
