// simulate.js

if (typeof window.logToPanel !== "function") {
    window.logToPanel = function(msg) { console.log(msg); };
}

function logWithTime(message) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-GB", { hour12: false });
    window.logToPanel(`[INFO] ${timeStr} — ${message}`);
}

logWithTime("[Latest] simulate.js loaded successfully");

// helper: seeded random
function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

async function evaluateCoin(symbol, units = 1) {
    try {
        const cleanSymbol = symbol.endsWith("USDT") ? symbol : symbol + "USDT";
        const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${cleanSymbol}`);
        const data = await res.json();
        return parseFloat(data.price) * units;
    } catch (err) {
        logWithTime(`[ERROR] ${symbol} price fetch failed: ${err}`);
        return 0; // ✅ return 0 instead of crashing
    }
}

async function getDynamicCoins() {
    const res = await fetch("https://api.binance.com/api/v3/ticker/24hr");
    const data = await res.json();
    const usdtPairs = data.filter(d => d.symbol.endsWith("USDT"));
    usdtPairs.sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume));
    return usdtPairs.slice(0, 20).map(d => d.symbol); // top 20 coins pool
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// global swap counter
if (typeof window.totalSwaps === "undefined") {
    window.totalSwaps = 0;
}

async function simulateCycle(cycleNum) {
    try {
        logWithTime(`[Latest] simulateCycle(${cycleNum}) started`);

        let investBalance = window.controls.investBalance;
        const reserve = investBalance * 0.1;
        let balance = investBalance - reserve;

        const allCoins = await getDynamicCoins();
        const randIndex = Math.floor(seededRandom(cycleNum) * allCoins.length);
        let coin = allCoins[randIndex];

        // Phase 1: Buy coin
        let entryPrice = await evaluateCoin(coin, 1);
        if (!entryPrice || entryPrice <= 0) {
            logWithTime(`[WARN] Cycle ${cycleNum}: Entry price fetch failed, skipping cycle`);
            return;
        }

        let coinUnits = balance / entryPrice;
        logWithTime(`Cycle ${cycleNum}: Bought ${coin}, ${coinUnits.toFixed(4)} units at ${entryPrice.toFixed(4)} USDT`);

        await sleep(30000);

        // Phase 2: Check price after 30s
        let currentPrice = await evaluateCoin(coin, 1);
        if (!currentPrice || currentPrice <= 0) {
            logWithTime(`[WARN] Cycle ${cycleNum}: Price fetch failed, skipping profit/loss update`);
            return; // ✅ skip balance update to avoid phantom loss
        }

        let profit = (currentPrice - entryPrice) * coinUnits;

        let startBox = parseFloat(document.getElementById("startBalance").value);
        let investBox = parseFloat(document.getElementById("investBalance").value);
        document.getElementById("startBalance").value = (startBox + profit).toFixed(2);
        document.getElementById("investBalance").value = (investBox + profit).toFixed(2);

        logWithTime(`Cycle ${cycleNum}: Result after 30s — ${profit >= 0 ? "Profit" : "Loss"} (${profit.toFixed(2)} USDT)`);

        // Phase 3: Adaptive swap allocation
        // Spread swaps across cycles: allow in 1–3, 4–6, 7–10
        const eligibleSwapWindows = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9, 10]
        ];

        let shouldSwap = false;
        if (window.totalSwaps < 3) {
            // Check if current cycle is in an eligible window
            const windowIndex = window.totalSwaps; // 0,1,2
            if (eligibleSwapWindows[windowIndex].includes(cycleNum)) {
                // Criteria: profit below target OR loss beyond stop-loss
                const profitTargetAbs = (window.controls.profitTarget / 100) * investBalance;
                const stopLossAbs = (window.controls.stopLoss / 100) * investBalance;

                if (profit < profitTargetAbs || profit < -stopLossAbs) {
                    shouldSwap = true;
                }
            }
        }

        if (shouldSwap) {
            const totalFeeFactor = 0.9999; // 0.01% fee
            balance = (coinUnits * currentPrice) * totalFeeFactor;

            // ✅ Apply fee only when swap happens
            startBox = parseFloat(document.getElementById("startBalance").value);
            investBox = parseFloat(document.getElementById("investBalance").value);
            document.getElementById("startBalance").value = (startBox * totalFeeFactor).toFixed(2);
            document.getElementById("investBalance").value = (investBox * totalFeeFactor).toFixed(2);

            const newIndex = (randIndex + 1) % allCoins.length;
            coin = allCoins[newIndex];
            entryPrice = await evaluateCoin(coin, 1);
            if (!entryPrice || entryPrice <= 0) {
                logWithTime(`[WARN] Cycle ${cycleNum}: Swap entry price fetch failed, skipping swap`);
                return;
            }

            coinUnits = balance / entryPrice;
            logWithTime(`[Latest] Swap triggered in cycle ${cycleNum}: into ${coin}, Units=${coinUnits.toFixed(4)}, Entry=${entryPrice.toFixed(4)} USDT`);

            await sleep(30000);

            currentPrice = await evaluateCoin(coin, 1);
            if (!currentPrice || currentPrice <= 0) {
                logWithTime(`[WARN] Cycle ${cycleNum}: Swap price fetch failed, skipping profit/loss update`);
                return;
            }

            profit = (currentPrice - entryPrice) * coinUnits;

            startBox = parseFloat(document.getElementById("startBalance").value);
            investBox = parseFloat(document.getElementById("investBalance").value);
            document.getElementById("startBalance").value = (startBox + profit).toFixed(2);
            document.getElementById("investBalance").value = (investBox + profit).toFixed(2);

            logWithTime(`Cycle ${cycleNum}: Result after swap — ${profit >= 0 ? "Profit" : "Loss"} (${profit.toFixed(2)} USDT)`);

            window.totalSwaps++;
        } else {
            logWithTime(`[INFO] Cycle ${cycleNum}: Swap skipped (criteria not met or not in eligible window)`);
        }

        logWithTime(`[Latest] simulateCycle(${cycleNum}) complete`);
    } catch (err) {
        logWithTime(`[ERROR] simulateCycle(${cycleNum}) crashed: ${err}`);
    }
}

window.simulateCycle = simulateCycle;
