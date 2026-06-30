
document.body.innerHTML += "<br>[main.js] loaded successfully";
async function initBot(userId) {
  const panel = document.getElementById("label");
  if (panel) {
    panel.innerHTML = "how are you (user " + userId + ")";
  }
}

window.initBot = initBot;
