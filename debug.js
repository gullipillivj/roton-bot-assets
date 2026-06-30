function debugLog(module, message, extra) {
  console.log(`[${module}] ${message}`, extra || "");
}
function debugError(module, err) {
  console.error(`[${module}] ERROR:`, err);
}

window.debugLog = debugLog;
window.debugError = debugError;
