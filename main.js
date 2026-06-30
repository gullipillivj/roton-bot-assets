async function initBot(userId) {
  // Update the Log Panel so you can see it in the page
  const panel = document.getElementById("logPanel");
  if (panel) {
    panel.innerHTML += "<br>[main] initBot executed for " + userId;
  }

  // Also log to console for double confirmation
  console.log("[main] initBot executed for " + userId);
}

// Expose globally
window.initBot = initBot;
