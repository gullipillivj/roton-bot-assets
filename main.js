async function initBot(userId) {
  debugLog("main", `Initializing bot for user ${userId}`);

  try {
    const today = new Date().toISOString().split("T")[0];
    if (controls.lastRunDate !== today) {
      await wipeDailyTrend();
      await wipeHistory();
      controls.lastRunDate = today;
      debugLog("main", "Daily reset completed", { date: today });
    }

    controls.isRunning = true;
    await runBot(userId);
    controls.isRunning = false;

    debugLog("main", "Bot run completed successfully");
  } catch (err) {
    debugError("main", err);
    controls.isRunning = false;
  }
}
window.initBot = initBot;
