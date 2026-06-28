// debug.js
const DEBUG_ENABLED = true;  // toggle globally

function debugLog(module, message, data = null) {
    if (DEBUG_ENABLED) {
        const timestamp = new Date().toISOString();
        console.log(`[DEBUG] [${timestamp}] [${module}] ${message}`);
        if (data) {
            console.log(`[DEBUG DATA]`, JSON.stringify(data, null, 2));
        }
    }
}

function debugError(module, error) {
    const timestamp = new Date().toISOString();
    console.error(`[ERROR] [${timestamp}] [${module}] ${error.stack || error}`);
}

module.exports = { debugLog, debugError };
