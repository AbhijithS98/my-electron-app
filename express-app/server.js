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
  
  // // handle forwarded requests
  // socket.on("http-request", async (payload, ack) => {
  //   try {
  //     const url = `http://127.0.0.1:${PORT}${payload.path}`;
  //     const resp = await axios({
  //       method: payload.method,
  //       url,
  //       headers: payload.headers,
  //       data: payload.body,
  //       validateStatus: () => true, 
  //     });
  //     console.log("response is: ",resp);
      
  //     ack({
  //       status: resp.status,
  //       headers: resp.headers,
  //       body: resp.data,
  //     });
  //   } catch (err) {
  //     ack({ status: 500, headers: {}, body: "Local error: " + err.message });
  //   }
  // });

  socket.on("perform-task", async (task) => {
    try {
      const resp = await axios.get(task.endpoint, { validateStatus: () => true });

      socket.emit("task-response", {
        client: task.client,
        endpoint: task.endpoint,
        status: resp.status,
        headers: resp.headers,
        body: resp.data,
      });
    } catch (err) {
      socket.emit("task-response", {
        client: task.client,
        endpoint: task.endpoint,
        status: 500,
        body: "Error: " + err.message,
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
