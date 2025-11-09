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

// Handle disconnects sent by navigator.sendBeacon
app.post("/disconnect", express.json(), (req, res) => {
  const { room, usernameHTML } = req.body;
  console.log(`Disconnect beacon received: ${usernameHTML} leaving ${room}`);
  res.sendStatus(200);
});

// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// --- WebSocket setup ---
const wss = new WebSocket.Server({ server });

// Rooms object: { roomName: Set of clients }
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
          if (!rooms[ws.room]) rooms[ws.room] = new Set();
          rooms[ws.room].add(ws);
          console.log(`Client joined room: ${ws.room}`);
          break;

        case "message":
        case "entrance":
          if (!ws.room) return;
          const roomClients = rooms[ws.room];
          if (roomClients) {
            for (const client of roomClients) {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  ...data,
                  room: ws.room // attach room name to broadcast
                }));
              }
            }
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
      rooms[ws.room].delete(ws);
      console.log(`Client disconnected from room: ${ws.room}`);

      // Clean up empty rooms
      if (rooms[ws.room].size === 0) {
        delete rooms[ws.room];
        console.log(`Room ${ws.room} is now empty and was removed.`);
      }
    }
  });

  // Handle abnormal socket termination (browser closed abruptly)
  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
    if (ws.room && rooms[ws.room]) {
      rooms[ws.room].delete(ws);
    }
  });
});
