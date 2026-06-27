async function getStrength(symbol) {
  try {
    const closes = await fetchPrices(symbol);

    // RSI calculation
    const rsi = technicalindicators.RSI.calculate({ values: closes, period: 14 });

    // EMA calculations
    const emaShort = technicalindicators.EMA.calculate({ values: closes, period: 5 });
    const emaLong = technicalindicators.EMA.calculate({ values: closes, period: 20 });

    const latestPrice = closes[closes.length - 1];
    const latestRSI = rsi[rsi.length - 1];
    const latestShort = emaShort[emaShort.length - 1];
    const latestLong = emaLong[emaLong.length - 1];

    // Score combines RSI + EMA difference
    const score = latestRSI + (latestShort - latestLong);

    return { symbol, price: latestPrice, rsi: latestRSI, score };
  } catch (err) {
    console.error("Error calculating strength for", symbol, err);
    return { symbol, price: 0, rsi: 0, score: -999 };
  }
}
