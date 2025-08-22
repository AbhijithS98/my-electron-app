const express = require('express');
const localtunnel = require('localtunnel');

let serverInstance = null;
let tunnelInstance = null;
let publicUrl = null;

// Start Express server
const app = express();
const PORT = 3050;

app.get('/', (req, res) => {
  res.send('Express server is running!');
});

serverInstance = app.listen(PORT, () => {
  console.log(`Express app listening at http://localhost:${PORT}`);
});

async function startServer() {
  if (serverInstance) return publicUrl; 

  // Starting LocalTunnel client 
  tunnelInstance = await localtunnel({
    port: PORT,
    host: 'http://visionvibe.sbs', 
    // header: {
    //     'x-access-token': 'my_super_secret_token' 
    // }
  });

  publicUrl = tunnelInstance.url;
  console.log(`Tunnel established at ${publicUrl}`);

  tunnelInstance.on('close', () => {
    console.log('Tunnel closed');
  });

  return publicUrl;
}

function stopServer() {
  if (serverInstance) {
    serverInstance.close(() => {
      console.log('express server stopped.');
      serverInstance = null;
    });
  }
  if (tunnelInstance) {
    tunnelInstance.close(() => {
      console.log('tunnel instance closed.');
      tunnelInstance = null;
    });
  }
  publicUrl = null;
}

function isRunning() {
  return !!serverInstance;
}

function getPublicUrl() {
  return publicUrl;
}

module.exports = { startServer, stopServer, isRunning, getPublicUrl };
