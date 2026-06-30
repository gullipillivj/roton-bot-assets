async function initBot(userId) {
  debugLog("main", `Initializing bot for user ${userId}`);
  await runBot(userId);
  debugLog("main", "Bot run completed successfully");
}

window.initBot = initBot;
