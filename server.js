const express = require("express");
const path = require("path");
const WebSocket = require("ws");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

app.get("/whochat", (req, res) => res.sendFile(path.join(__dirname, "public/pages/whochat.html")));
app.get("/frontdoor/:room", (req, res) => res.sendFile(path.join(__dirname, "public/pages/frontdoor.html")));
app.get("/room/:room", (req, res) => res.sendFile(path.join(__dirname, "public/pages/room.html")));

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const wss = new WebSocket.Server({ server });

// Rooms object: { roomName: Set of clients }
const rooms = {};

wss.on("connection", (ws) => {
  ws.room = null;

  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);

      if (data.type === "join") {
        ws.room = data.room;
        if (!rooms[ws.room]) rooms[ws.room] = new Set();
        rooms[ws.room].add(ws);
      }

      if ((data.type === "message" || data.type === "entrance") && ws.room) {
        rooms[ws.room].forEach(client => {
          if (client.readyState === WebSocket.OPEN) client.send(JSON.stringify(data));
        });
      }
    } catch (err) {
      console.error("WebSocket parse error:", err);
    }
  });

  ws.on("close", () => {
    if (ws.room && rooms[ws.room]) {
      rooms[ws.room].delete(ws);
      if (rooms[ws.room].size === 0) delete rooms[ws.room];
    }
  });
});
