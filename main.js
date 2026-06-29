// main.js

function initBot(userId) {
  // Find the label element
  const label = document.getElementById("statusLabel");
  if (label) {
    // Update label with hello message
    label.innerText = "Hello " + userId;
  }
}

// Expose globally
window.initBot = initBot;
