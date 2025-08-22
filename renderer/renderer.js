const toggleBtn = document.getElementById("toggle-server-btn");
const statusBox = document.querySelector(".status-box");
const statusText = document.getElementById("status-text");
const publicUrlSpan = document.getElementById("public-url");

let isRunning = false;
let publicUrl = null;

async function getLocalIp() {
  let localIp = await window.api.getLocalIp();
  console.log("local IP : ",localIp);
}

async function updateUI() {
  isRunning = await window.api.getServerStatus();
  if (isRunning) {
    statusBox.classList.add("status-running");
    statusText.textContent = "Running";
    const url = await window.api.getPublicUrl();
    if (url) {
      publicUrlSpan.textContent = url; // show tunnel URL instead of real IP
    }
    toggleBtn.textContent = "Stop Server";
  } else {
    statusBox.classList.remove("status-running");
    statusText.textContent = "Stopped";
    publicUrlSpan.textContent = "Not available";
    toggleBtn.textContent = "Start Server";
  }
}


// async function fetchPublicIP() {
//   try {
//     const res = await fetch("https://api64.ipify.org?format=json");
//     const data = await res.json();
//     publicIp = data.ip;
//     publicIpSpan.textContent = data.ip;
//   } catch (err) {
//     publicIpSpan.textContent = "Error fetching IP";
//   }
// }


// Button click logic
toggleBtn.addEventListener('click', async () => {
  if (isRunning) {
    await window.api.stopServer();
  } else {
    const url = await window.api.startServer();
    publicUrlSpan.textContent = url || "Error starting tunnel";
  }
  updateUI();
});


// Initialize UI
getLocalIp();
updateUI();

