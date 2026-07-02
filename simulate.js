// simulate.js
async function simulateCycle(cycleNumber) {
    const investBalance = window.controls.investBalance;
    const reserve = investBalance * 0.1;
    let balance = investBalance - reserve;

    // 🔗 call into coins.js
    const coin = await pickBestCoin();
    const usdtValue = await evaluateCoin(coin, balance);

    // 🔥 force a buy log
    console.log(`[CYCLE ${cycleNumber}] Bought ${coin} with ${balance.toFixed(2)} USDT`);
    console.log(`[CYCLE ${cycleNumber}] Current value: ${usdtValue.toFixed(2)} USDT`);

    // update balance
    window.controls.investBalance = usdtValue + reserve;
}
