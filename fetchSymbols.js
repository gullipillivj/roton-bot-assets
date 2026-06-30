let symbols = [];

async function fetchSymbols() {
  try {
    const res = await fetch("https://api.binance.com/api/v3/exchangeInfo");
    const data = await res.json();
    symbols = data.symbols
      .filter(s => s.status === "TRADING" && s.symbol.endsWith("USDT"))
      .map(s => s.symbol);

    console.log("Fetched symbols:", symbols.length);
  } catch (err) {
    console.error("Error fetching symbols:", err);
  }
}
window.fetchSymbols = fetchSymbols;
