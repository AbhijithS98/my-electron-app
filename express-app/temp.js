const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");

const PORT = 3000;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const clients = new Map();

// Example test tasks array
const tasks = [
  { client: "clientA", endpoint: "https://google.com" },
  { client: "clientB", endpoint: "https://yahoo.com" },
  { client: "clientA", endpoint: "https://example.com" },
];

// when Express app connects
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("register", (tunnelId) => {
    clients.set(tunnelId, socket);
    console.log(`Registered tunnel: ${tunnelId}`);
  });

  socket.on("disconnect", () => {
    for (let [id, s] of clients.entries()) {
      if (s.id === socket.id) {
        clients.delete(id);
        console.log(`Tunnel closed: ${id}`);
      }
    }
  });
});

// relay HTTP traffic to Express client
app.use(express.text({ type: "*/*" })); // parse raw body as string for now

app.all("/tunnel/:id/*", async (req, res) => {
  const tunnelId = req.params.id;
  const socket = clients.get(tunnelId);
  if (!socket) return res.status(502).send("Tunnel not connected");

  const reqId = uuidv4();
  const path = req.originalUrl.replace(`/tunnel/${tunnelId}`, "") || "/";

  const payload = {
    id: reqId,
    method: req.method,
    path,
    headers: req.headers,
    body: req.body,
  };

  // send to client, wait for response with ack
  try {
    const [response] = await socket.timeout(10000).emitWithAck("http-request", payload);
    res.status(response.status).set(response.headers).send(response.body);
  } catch (err) {
    res.status(504).send("Timeout waiting for local app");
  }
});


server.listen(PORT, () => {
  console.log(`Relay server listening on port ${PORT}`);
});