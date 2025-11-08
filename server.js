const express = require("express");
const path = require("path");
const WebSocket = require("ws");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
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

// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// WebSocket setup
const wss = new WebSocket.Server({ server });

// Rooms object: { roomName: [ws, ws, ...] }
let rooms = {};

wss.on("connection", (ws) => {
  console.log("New WebSocket connection");

  ws.room = null;

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);

      switch (data.type) {
        case "join":
          ws.room = data.room;
          if (!rooms[ws.room]) rooms[ws.room] = [];
          if (!rooms[ws.room].includes(ws)) rooms[ws.room].push(ws);
          console.log(`Client joined room: ${ws.room}`);
          break;

        case "message":
        case "entrance":
          if (!ws.room) return;
          const roomClients = rooms[ws.room];
          if (roomClients) {
            roomClients.forEach(client => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  ...data,
                  room: ws.room // ✅ attach the room name to outgoing message
                }));
              }
            });
          }
          break;

        default:
          console.warn("Unknown message type:", data.type);
      }
    } catch (e) {
      console.error("Error parsing WebSocket message:", e);
    }
  });

  ws.on("close", () => {
    if (ws.room && rooms[ws.room]) {
      rooms[ws.room] = rooms[ws.room].filter(c => c !== ws);
      console.log(`Client disconnected from room: ${ws.room}`);
    }
  });
});
