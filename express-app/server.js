const express = require('express');
const app = express();

const PORT = 3000;
let server = null;

app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

function startServer() {
  if (!server) {
    server = app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  }
}

function stopServer() {
  if (server) {
    server.close(() => {
      console.log('Server stopped.');
      server = null;
    });
  }
}

function isRunning() {
  return !!server;
}

module.exports = { startServer, stopServer, isRunning };
