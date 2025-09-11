require("dotenv").config();
const express = require("express");
const { io } = require("socket.io-client");
const axios = require("axios");
const getResponseType = require("./utils/resType.js");

let serverInstance = null;
let socket = null;
const clientId = "clientA";
const io_server_url = process.env.IO_SERVER_URL;

// Start Express server
const app = express();
const PORT = process.env.PORT || 3050;

// Simple route for testing
app.get("/", (req, res) => {
  res.send("Hello from Electron's express app!");
});

async function startServer() {
  if (serverInstance) return clientId;

  serverInstance = app.listen(PORT, () => {
    console.log(`Local Express running at http://localhost:${PORT}`);
  });

  // connect to relay server 
  socket = io(io_server_url, {
    maxHttpBufferSize: 10e6, // 10MB limit
  });

  socket.on("connect", () => {
    console.log("-> Connected to relay with id:", socket.id);
    socket.emit("register", clientId);
  });

  // Listen for jobs
  socket.on("perform-job", async (job) => {
    console.log("-> Received job:", job);

    const { requestId, streamId, endpoint, method, headers, payload } = job;

    try {
      // axios config
      const axiosConfig = {
        url: endpoint,
        method,
        headers,
        data: payload,
        timeout: 30000 // ← 30 seconds timeout
      };

      // Check if Accept header requests CSV or ZIP
      const acceptHeader = headers?.Accept || headers?.accept || "";
      if (acceptHeader.includes("csv") || acceptHeader.includes("zip")) {
        axiosConfig.responseType = "arraybuffer";
      }


      // Make the API call
      const res = await axios(axiosConfig);
      console.log("-> response is: ", res);
      console.log(typeof res.data);

      //Determine response type
      const contentType = getResponseType(res.headers["content-type"] || "");

      let serializedBody;
      let encoding = "none";

      // Serialize based on actual response type
      switch (contentType) {
          case 'json':
            // res.data will already be a parsed JS object
            serializedBody = res.data;
            encoding = 'none';
            break;

          case "csv":
            // Convert buffer to string
            if (Buffer.isBuffer(res.data)) {
              serializedBody = res.data.toString("utf8");
            } else {
              serializedBody = res.data; // Already string
            }
            encoding = "utf8";
            break;

          case "zip":
            if (!Buffer.isBuffer(res.data)) {
              throw new Error("Expected Buffer for ZIP response but got: " + typeof res.data);
            }
            serializedBody = res.data.toString("base64"); // Convert buffer to Base64 string for safe transmission
            encoding = "base64";
            break;
          
          default:
            if (Buffer.isBuffer(res.data)) {
              serializedBody = res.data.toString('base64'); // Convert binary to safe string
              encoding = 'base64'; 
            }
            else {
              serializedBody = res.data; // Already a string
              encoding = 'utf8'; 
            }
      }

      // Send back response with reqId intact
      socket.emit("job-response", {
        requestId,
        streamId,
        clientId,
        status: res.status,
        headers: res.headers,
        body: serializedBody,
        encoding,
        contentType
      });


    } catch (err) {
      console.error("-> Error in perform-job:", err.message);

      const errorResponse = {
        requestId,
        error: err.message,
        code: err.code,
        isAxiosError: err.isAxiosError,
        endpoint
      };

      if (err.isAxiosError) {
        errorResponse.status = err.response?.status;
        errorResponse.responseData = err.response?.data;
      }

      socket.emit("job-response", errorResponse);
      }
  });

  // Add disconnect handler
  socket.on("disconnect", (reason) => {
    console.log("-> Socket disconnected:", reason);
  });

  return clientId;
}

function stopServer() {
  if (serverInstance) {
    serverInstance.close(() => {
      console.log("-> Express server stopped.");
      serverInstance = null;
    });
  }

  if (socket) {
    socket.disconnect();
    console.log("-> Socket disconnected from relay");
    socket = null;
  }
}

function isRunning() {
  return !!serverInstance;
}

module.exports = { startServer, stopServer, isRunning };
