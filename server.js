const express = require("express");
const path = require("path");
const WebSocket = require("ws");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/whochat", (req, res) => res.sendFile(path.join(__dirname, "public/pages/whochat.html")));
app.get("/frontdoor/:room", (req, res) => res.sendFile(path.join(__dirname, "public/pages/frontdoor.html")));
app.get("/room/:room", (req, res) => res.sendFile(path.join(__dirname, "public/pages/room.html")));

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// WebSocket server
const wss = new WebSocket.Server({ server });

// Rooms: { roomName: Set of ws connections }
let rooms = {};

// Server-side identity storage: { ws: {identityHTML, room} }
let identities = new Map();

wss.on("connection", (ws) => {
  console.log("New WebSocket connection");

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);

      switch (data.type) {
        case "join":
          ws.room = data.room;
          if (!rooms[ws.room]) rooms[ws.room] = new Set();
          rooms[ws.room].add(ws);

          // Store the identity for this connection
          identities.set(ws, { identityHTML: data.identityHTML || "[Unknown Identity]", room: ws.room });
          console.log(`User joined room: ${ws.room}`);
          break;

        case "entrance":
          if (!ws.room) return;
          broadcast(ws.room, {
            type: "entrance",
            identityHTML: data.identityHTML,
            message: data.message
          });
          break;

        case "message":
          if (!ws.room) return;
          broadcast(ws.room, {
            type: "message",
            identityHTML: data.identityHTML,
            mood: data.mood,
            postTo: data.postTo,
            message: data.message
          });
          break;

        default:
          console.warn("Unknown message type:", data.type);
      }
    } catch (e) {
      console.error("Error parsing message:", e);
    }
  });

  ws.on("close", () => {
    if (ws.room && rooms[ws.room]) {
      rooms[ws.room].delete(ws);
      identities.delete(ws);
      console.log(`User disconnected from room: ${ws.room}`);

      if (rooms[ws.room].size === 0) delete rooms[ws.room];
    }
  });
});

// Helper: broadcast message to all clients in a room
function broadcast(room, data) {
  const clients = rooms[room] || [];
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) client.send(JSON.stringify(data));
  }
}
