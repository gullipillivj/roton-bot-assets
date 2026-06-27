async function fetchPrices(symbol) {
  try {
    const res = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=50`
    );
    const data = await res.json();

    // Closing prices (index 4 in Binance kline array)
    return data.map(k => parseFloat(k[4]));
  } catch (err) {
    console.error("Error fetching prices for", symbol, err);
    return [];
  }
}
