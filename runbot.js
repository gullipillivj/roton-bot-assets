let holdings = {};

async function runbot() {
  let balance = parseFloat(document.getElementById("balance").value);
  let userProfitTarget = parseFloat(document.getElementById("profit").value) / 100;
  let profitTarget = Math.min(userProfitTarget, 0.02); // cap at 2%
  let stopLoss = parseFloat(document.getElementById("stoploss").value) / 100;
  let investment = parseFloat(document.getElementById("investment").value);
  let log = document.getElementById("log");

  let active = investment * 0.8;
  let buffer = investment * 0.2;

  if (!holdings.symbol) {
    // --- Entry logic: shortlist based on RSI + EMA rotation ---
    let results = [];
    for (let sym of symbols.slice(0, 50)) {
      try {
        let strength = await getStrength(sym);
        if (strength.rsi > 55 && strength.score > 0) {
          results.push(strength);
        }
      } catch (e) {
        console.error("Strength error:", e);
      }
    }

    results.sort((a, b) => b.score - a.score);
    let shortlist = results.slice(0, 5);

    // Update shortlist table
    let tbody = document.querySelector("#shortlistTable tbody");
    tbody.innerHTML = "";
    shortlist.forEach(s => {
      tbody.innerHTML += `<tr><td>${s.symbol}</td><td>${s.rsi.toFixed(2)}</td><td>${s.score.toFixed(2)}</td></tr>`;
    });

    if (shortlist.length > 0) {
      let best = shortlist[0];
      let qty = active / best.price;
      holdings = { symbol: best.symbol, qty, entry: best.price, buffer };

      document.getElementById("balance").value = balance - investment;
      document.getElementById("hops").value = parseInt(document.getElementById("hops").value) + 1;
      log.innerHTML += `<p>BUY ${qty.toFixed(4)} ${best.symbol} at ${best.price} (Buffer reserved)</p>`;
    }
  } else {
    // --- Exit logic: profit, stop loss, rotation ---
    const closes = await fetchPrices(holdings.symbol);
    const latestPrice = closes[closes.length - 1];
    let activeValue = holdings.qty * latestPrice;
    let totalValue = activeValue + holdings.buffer;

    updateStatus(activeValue, holdings.buffer, totalValue, investment, stopLoss);

    if (totalValue >= investment * (1 + profitTarget)) {
      balance += totalValue;
      document.getElementById("balance").value = balance;
      document.getElementById("profitMade").value =
        parseFloat(document.getElementById("profitMade").value) + (totalValue - investment);
      log.innerHTML += `<p>SELL ${holdings.symbol} at ${latestPrice}, Profit target reached</p>`;
      updateHistory(investment, totalValue - investment, "Target reached");
      updateStats(investment, totalValue - investment);
      holdings = {};
    } else if (totalValue <= investment * (1 - stopLoss)) {
      balance += totalValue;
      document.getElementById("balance").value = balance;
      log.innerHTML += `<p>Stop loss triggered at ${latestPrice}</p>`;
      updateHistory(investment, totalValue - investment, "Stop loss triggered");
      updateStats(investment, totalValue - investment);
      holdings = {};
    } else {
      // Rotation exit: EMA short < EMA long
      const emaShort = technicalindicators.EMA.calculate({ values: closes, period: 5 });
      const emaLong = technicalindicators.EMA.calculate({ values: closes, period: 20 });
      if (emaShort[emaShort.length - 1] < emaLong[emaLong.length - 1]) {
        balance += totalValue;
        document.getElementById("balance").value = balance;
        log.innerHTML += `<p>Rotation exit at ${latestPrice}</p>`;
        updateHistory(investment, totalValue - investment, "Rotation exit");
        updateStats(investment, totalValue - investment);
        holdings = {};
      }
    }
  }
}
