const express = require('express');
const { io } = require("socket.io-client");
const axios = require("axios");

let serverInstance = null;
let socket = null;

// Start Express server
const app = express();
const PORT = 3050;

// Simple route for testing
app.get("/hello", (req, res) => {
  console.log("hello root hit.!!!");
  res.send("Hello from local Express app!");
});

const tunnelId = "clientA";

async function startServer() {
  if (serverInstance) return tunnelId;

  serverInstance = app.listen(PORT, () => {
    console.log(`Local Express running at http://localhost:${PORT}`);
  });

  // connect to relay server
  const relayURL = "http://visionvibe.sbs";
  socket = io(relayURL);
  
  socket.on("connect", () => {
    console.log("Connected to relay with id:", socket.id);
     socket.emit("register", tunnelId);
  });
  

  // Listen for jobs
  socket.on("perform-task", async (job) => {
    console.log("📥 Received job:", job);

    const { requestId, endpoint, method, headers, payload } = job;

    try {
      const res = await axios({
        url: endpoint,
        method,
        headers,
        data: payload
      });

      // Send back response with reqId intact
      socket.emit("task-response", {
        requestId,
        status: res.status,
        body: res.data
      });

    } catch (err) {
      socket.emit("task-response", {
        requestId,
        error: err.message
      });
    }
  });
  
  return tunnelId;
}

function stopServer() {
  if (serverInstance) {
      serverInstance.close(() => {
        console.log('Express server stopped.');
        serverInstance = null;
    });
  }

  if (socket) {
    socket.disconnect(); 
    console.log("Socket disconnected from relay");
    socket = null;
  }
}

function isRunning() {
  return !!serverInstance;
}


module.exports = { startServer, stopServer, isRunning };
