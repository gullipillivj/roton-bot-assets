let botInterval;

function showDebug(msg, color="black") {
  const label = document.getElementById("debugLabel");
  label.style.color = color;
  label.textContent = msg;
}

function startBot() {
  showDebug("Bot started...", "green");
  botInterval = setInterval(simulate, 15000);
}

function stopBot() {
  clearInterval(botInterval);
  showDebug("Bot stopped.", "red");
}

function goHome() {
  showDebug("Exiting to home...", "blue");
  window.location.href = "/";
}
