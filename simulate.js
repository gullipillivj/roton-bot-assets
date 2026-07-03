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
        return 0;
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

async function simulateCycle(cycleNum) {
    logWithTime(`[Latest] simulateCycle(${cycleNum}) started`);

    let investBalance = window.controls.investBalance;
    const reserve = investBalance * 0.1;
    let balance = investBalance - reserve;

    // 🔁 Get dynamic coin pool
    const allCoins = await getDynamicCoins();
    const randIndex = Math.floor(seededRandom(cycleNum) * allCoins.length);
    let coin = allCoins[randIndex];

    // Phase 1: Buy coin
    let entryPrice = await evaluateCoin(coin, 1);
    let coinUnits = balance / entryPrice;
    logWithTime(`Cycle ${cycleNum}: Bought ${coin}, ${coinUnits.toFixed(4)} units at ${entryPrice.toFixed(4)} USDT`);

    // Hold for 30s
    await sleep(30000);

    // Phase 2: Check price after 30s
    let currentPrice = await evaluateCoin(coin, 1);
    let profit = (currentPrice - entryPrice) * coinUnits;

    let startBox = parseFloat(document.getElementById("startBalance").value);
    let investBox = parseFloat(document.getElementById("investBalance").value);
    document.getElementById("startBalance").value = (startBox + profit).toFixed(2);
    document.getElementById("investBalance").value = (investBox + profit).toFixed(2);

    logWithTime(`Cycle ${cycleNum}: Result after 30s — ${profit >= 0 ? "Profit" : "Loss"} (${profit.toFixed(2)} USDT)`);

    // Phase 3: Swap to new coin with fees
    const totalFeeFactor =   0.9999; // 0.75% fees
    balance = (coinUnits * currentPrice) * totalFeeFactor;

    startBox = parseFloat(document.getElementById("startBalance").value);
    investBox = parseFloat(document.getElementById("investBalance").value);
    document.getElementById("startBalance").value = (startBox * totalFeeFactor).toFixed(2);
    document.getElementById("investBalance").value = (investBox * totalFeeFactor).toFixed(2);

    const newIndex = (randIndex + 1) % allCoins.length;
    coin = allCoins[newIndex];
    entryPrice = await evaluateCoin(coin, 1);
    coinUnits = balance / entryPrice;
    logWithTime(`[Latest] Swapped into ${coin}, Units=${coinUnits.toFixed(4)}, Entry=${entryPrice.toFixed(4)} USDT after fees`);

    // Hold new coin for 30s
    await sleep(30000);

    // Phase 4: Check new coin price
    currentPrice = await evaluateCoin(coin, 1);
    profit = (currentPrice - entryPrice) * coinUnits;

    startBox = parseFloat(document.getElementById("startBalance").value);
    investBox = parseFloat(document.getElementById("investBalance").value);
    document.getElementById("startBalance").value = (startBox + profit).toFixed(2);
    document.getElementById("investBalance").value = (investBox + profit).toFixed(2);

    logWithTime(`Cycle ${cycleNum}: Result after swap 30s — ${profit >= 0 ? "Profit" : "Loss"} (${profit.toFixed(2)} USDT)`);

    logWithTime(`[Latest] simulateCycle(${cycleNum}) complete`);

    balanceHistory.push(parseFloat(document.getElementById("investBalance").value));
    updateChart();
}

window.simulateCycle = simulateCycle;
