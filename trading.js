// trading.js — trading loop, hop logic, fee/time checks
// Debug mode enabled

let running = false;
let balance = 1000;
let investment = 500;
let profit = 0;
let position = null;
let profitTarget = 1;
let stopLoss = 0.5;
let holdStart = null;
let hopCount = 0;
let fees = 0;
let feeRate = 0.001; // 0.1%
let startTime = null;

async function tradingLoop(runNumber) {
    const symbols = ["BTCUSDT","ETHUSDT","BNBUSDT","ADAUSDT","LINKUSDT"];
    while (running) {
        try {
            if (!position) {
                const bestCoin = await pickBestCoin(symbols);
                if (bestCoin) {
                    const qty = investment / bestCoin.price;
                    position = { symbol: bestCoin.symbol, price: bestCoin.price, qty: qty };
                    holdStart = Date.now();
                    showTrend(bestCoin.change24h);
                    logMessage(`Bought ${bestCoin.symbol} at ${bestCoin.price} | Qty: ${qty.toFixed(6)} | Invested: ${investment.toFixed(2)} USDT`);
                    updateCurrentValue(bestCoin.price, position);
                    console.debug("[Trading] Initial buy:", position);
                }
            } else {
                const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${position.symbol}`);
                const data = await res.json();
                const currentPrice = parseFloat(data.price);
                updateCurrentValue(currentPrice, position);

                // Profit target check
                if (currentPrice > position.price * (1 + profitTarget/100)) {
                    const tradeProfit = (currentPrice - position.price) * position.qty;
                    profit += tradeProfit;
                    balance += tradeProfit;
                    logMessage(`Sold ${position.symbol} at ${currentPrice} | Profit: ${tradeProfit.toFixed(2)} | Balance: ${balance.toFixed(2)}`);
                    position = null;
                    holdStart = null;
                    console.debug("[Trading] Profit target hit:", tradeProfit);
                } else {
                    // Immediate hop if falling
                    if (currentPrice < position.price) {
                        logMessage(`${position.symbol} is falling at ${currentPrice.toFixed(2)}, hopping...`);
                        hopCount++;
                        fees += investment * feeRate;
                        const bestCoin = await pickBestCoin(symbols);
                        if (bestCoin) {
                            const qty = investment / bestCoin.price;
                            position = { symbol: bestCoin.symbol, price: bestCoin.price, qty: qty };
                            holdStart = Date.now();
                            showTrend(bestCoin.change24h);
                            logMessage(`Hop #${hopCount} | Fees so far: ${fees.toFixed(4)} USDT`);
                            logMessage(`Bought ${bestCoin.symbol} at ${bestCoin.price} | Qty: ${qty.toFixed(6)} | Invested: ${investment.toFixed(2)} USDT`);
                            updateCurrentValue(bestCoin.price, position);
                            console.debug("[Trading] Hop executed:", position);
                        }
                    } else {
                        logMessage(`${position.symbol} is holding upward at ${currentPrice.toFixed(2)}`);
                    }

                    // Force hop if 2 minutes passed without upward movement
                    if (holdStart && (Date.now() - holdStart) >= 120000) {
                        logMessage("2 minutes passed without upward trend, forcing hop...");
                        hopCount++;
                        fees += investment * feeRate;
                        const bestCoin = await pickBestCoin(symbols);
                        if (bestCoin) {
                            const qty = investment / bestCoin.price;
                            position = { symbol: bestCoin.symbol, price: bestCoin.price, qty: qty };
                            holdStart = Date.now();
                            showTrend(bestCoin.change24h);
                            logMessage(`Hop #${hopCount} | Fees so far: ${fees.toFixed(4)} USDT`);
                            logMessage(`Bought ${bestCoin.symbol} at ${bestCoin.price} | Qty: ${qty.toFixed(6)} | Invested: ${investment.toFixed(2)} USDT`);
                            updateCurrentValue(bestCoin.price, position);
                            console.debug("[Trading] Forced hop executed:", position);
                        }
                    }
                }

                // Stop conditions
                if (fees >= profit) {
                    logMessage("Fees exceeded profit. Stopping bot.");
                    stopBot(runNumber);
                    break;
                }
                if (hopCount >= 12) {
                    logMessage("Hop limit (12) reached. Stopping bot.");
                    stopBot(runNumber);
                    break;
                }
                if (Date.now() - startTime >= 2700000) {
                    logMessage("Max runtime 45 mins reached. Stopping bot.");
                    stopBot(runNumber);
                    break;
                }
            }
        } catch (err) {
            logMessage("Error: " + err);
            console.error("[Trading] Error:", err);
        }
        await new Promise(r => setTimeout(r, 15000)); // 15 sec checks
    }
}
