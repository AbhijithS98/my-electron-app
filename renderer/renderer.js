const toggleBtn = document.getElementById("toggle-server-btn");
const statusBox = document.querySelector(".status-box");
const statusText = document.getElementById("status-text");
const statusIndicator = document.getElementById("status-indicator");

let isRunning = false;

async function updateUI() {
  isRunning = await window.api.getServerStatus();
  if (isRunning) {
    statusBox.classList.add("status-running");
    statusText.textContent = "Running";
    toggleBtn.textContent = "Stop Server";
  } else {
    statusBox.classList.remove("status-running");
    statusText.textContent = "Stopped";
    toggleBtn.textContent = "Start Server";
  }
}

// Button click logic
toggleBtn.addEventListener('click', async () => {
  if (isRunning) {
    await window.api.stopServer();
  } else {
    await window.api.startServer();
  }
  updateUI();
});

// Initialize UI
updateUI();
