async function runBot(userId) {
  debugLog("runbot", `Bot started for user ${userId}`);

  // Minimal test loop: 3 cycles
  for (let i = 1; i <= 3; i++) {
    debugLog("runbot", `Cycle ${i} started`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1s
    debugLog("runbot", `Cycle ${i} completed`);
  }

  debugLog("runbot", "Bot finished test run");
}

window.runBot = runBot;
