
document.body.innerHTML += "<br>[main.js] loaded successfully";
async function initBot(userId) {
  const panel = document.getElementById("logPanel");
  if (panel) {
    panel.innerHTML += "<br>[main] initBot executed for " + userId;
  }
}

window.initBot = initBot;
