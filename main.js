function initBot(userId) {
  const panel = document.getElementById("label");
  if (panel) {
    // Overwrite whatever was there with "how are you"
    panel.innerHTML = "how are you";
  }
}

// Expose globally so inline onclick can find it
window.initBot = initBot;
