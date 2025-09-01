// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const { v4: uuidv4 } = require("uuid");


// const PORT = 3000;
// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//   },
// });

// const clients = new Map();

// // Example test tasks array
// const tasks = [
//   { client: "clientA", endpoint: "https://dummyjson.com/todos/2" },
//   { client: "clientB", endpoint: "https://dummyjson.com/todos/1" },
//   { client: "clientA", endpoint: "https://dummyjson.com/todos/3" },
// ];

// // when Express app connects
// io.on("connection", (socket) => {
//   console.log("Client connected:", socket.id);

//   socket.on("register", (tunnelId) => {
//     clients.set(tunnelId, socket);
//     console.log(`Registered tunnel: ${tunnelId}`);
//   });

//   socket.on("disconnect", () => {
//     for (let [id, s] of clients.entries()) {
//               if (s.id === socket.id) {
//         clients.delete(id);
//         console.log(`Tunnel closed: ${id}`);
//       }
//     }
//   });

//   // handle client response
//   socket.on("task-response", (resp) => {
//     console.log(
//       `Response from ${resp.client}: status=${resp.status}, endpoint=${resp.endpoint}`
//     );
//     console.log("Body snippet:", JSON.stringify(resp.body, null, 2)); // avoid dumping full HTML
//   });
// });


// // Helper: pick random item
// function getRandomTask() {
//   const idx = Math.floor(Math.random() * tasks.length);
//   return tasks[idx];
// }


// // Every 10 seconds, send a task to a client
// setInterval(() => {
//   if (clients.size === 0) {
//     console.log("⚠️ No clients connected right now.");
//     return;
//   }

//   const task = getRandomTask();
//   const socket = clients.get(task.client);

//   if (socket) {
//     console.log(`➡️Sending task to ${task.client}: ${task.endpoint}`);
//     socket.emit("perform-task", task); // send to that client
//   } else {
//     console.log(` Client ${task.client} not connected`);
//   }
// }, 10000);


// server.listen(PORT, () => {
//   console.log(`Relay server listening on port ${PORT}`);
// });













// // Handle Electron client connections
// io.on("connection", (socket) => {
//   console.log("✅ Electron client connected:", socket.id);

//   // Client registers itself
//   socket.on("register", (clientId) => {
//     clients.set(clientId, socket);
//     console.log(`🟢 Registered client: ${clientId}`);
//   });

//   // Client sends back a response
//   socket.on("task-response", (response) => {
//     console.log("📤 Got response from client:", response);

//     // Always publish response back to main platform
//     redisPub.publish("responses", JSON.stringify(response));
//   });

//   // Cleanup on disconnect
//   socket.on("disconnect", () => {
//     for (let [clientId, s] of clients.entries()) {
//       if (s === socket) {
//         clients.delete(clientId);
//         console.log(`🔴 Client disconnected: ${clientId}`);
//       }
//     }
//   });
// });
