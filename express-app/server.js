const express = require('express');
const { io } = require("socket.io-client");

let serverInstance = null;

// Start Express server
const app = express();
const PORT = 3050;

app.get('/', (req, res) => {
  res.send('Express server is running!');
});



async function startServer() {
  let response = null;
  if (serverInstance) return response;

  // connect to relay server
  const relayURL = "http://visionvibe.sbs";
  const socket = io(relayURL);

  socket.on("connect", () => {
    console.log("Connected to relay with id:", socket.id);
    socket.emit("hello", "Hello from Express app!");
  });

  socket.on("hello_ack", (msg) => {
    console.log("Relay replied:", msg);
    response = msg;
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from relay");
  });

  serverInstance = app.listen(PORT, () => {
    console.log(`Express app listening at http://localhost:${PORT}`);
  });
  return response;
}

function stopServer() {
  if (serverInstance) {
      serverInstance.close(() => {
        console.log('express server stopped.');
        serverInstance = null;
        socket.emit("disconnect");
    });
  }
}

function isRunning() {
  return !!serverInstance;
}


module.exports = { startServer, stopServer, isRunning };
