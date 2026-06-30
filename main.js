async function initBot(userId) {
  debugLog("main", ">>> Entered initBot for " + userId);

  // Minimal test
  if (typeof runBot === "function") {
    debugLog("main", "runBot is defined, calling now");
    await runBot(userId);
  } else {
    debugError("main", "runBot not found");
  }

  debugLog("main", "<<< Exiting initBot");
}

window.initBot = initBot;
