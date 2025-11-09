const express = require("express");
const path = require("path");
const WebSocket = require("ws");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public/
app.use(express.static(path.join(__dirname, "public")));

// Serve pages
app.get("/whochat", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/whochat.html"));
});
app.get("/frontdoor/:room", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/frontdoor.html"));
});
app.get("/room/:room", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/room.html"));
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// WebSocket setup
const wss = new WebSocket.Server({ server });
let rooms = {}; // { roomName: [ws, ws, ...] }

wss.on("connection", (ws, req) => {
  console.log("New WebSocket connection");

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);

      if (data.type === "join") {
        ws.room = data.room;
        if (!rooms[ws.room]) rooms[ws.room] = [];
        rooms[ws.room].push(ws);
      }

      if (data.type === "message" || data.type === "entrance") {
        const roomClients = rooms[ws.room] || [];
        roomClients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      }
    } catch (e) {
      console.error("Error parsing WebSocket message:", e);
    }
  });

  ws.on("close", () => {
    if (ws.room && rooms[ws.room]) {
      rooms[ws.room] = rooms[ws.room].filter(c => c !== ws);
    }
  });
});
 