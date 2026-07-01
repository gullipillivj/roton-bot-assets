async function runBot(userId) {
 
  // Minimal test loop: 3 cycles
  for (let i = 1; i <= 3; i++) {
     await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1s
      }
}

window.runBot = runBot;
