// room.js
const ws = new WebSocket(`wss://${window.location.host}`);

const roomName = window.location.pathname.split("/room/")[1];
const chatBox = document.getElementById("chatBox");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");

let usernameHTML = localStorage.getItem("usernameHTML") || "Anonymous";

// --- Utility ---
function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

function addMessageToChat(content, type = "message") {
  const div = document.createElement("div");
  div.classList.add(type);
  div.innerHTML = content;
  chatBox.appendChild(div);
  scrollToBottom();
}

function sendWS(type, message) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, room: roomName, message, usernameHTML }));
  }
}

// --- WebSocket setup ---
ws.onopen = () => {
  console.log("✅ Connected to WebSocket");
  sendWS("join");
  sendWS("entrance", `${usernameHTML} <font color=#888888>enters the room.</font>`);
};

ws.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    if (data.room !== roomName) return;

    if (data.type === "message" || data.type === "entrance") {
      addMessageToChat(data.message);
    }
  } catch (err) {
    console.error("Error handling message:", err);
  }
};

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (!message) return;

  const formatted = `<div>${usernameHTML} <font color=#444444>»</font> ${message}</div>`;
  sendWS("message", formatted);
  messageInput.value = "";
});

chatBox.addEventListener("DOMNodeInserted", scrollToBottom);

// --- Detecting actual leave (not refresh) ---
window.addEventListener("beforeunload", (event) => {
  // Detect if the navigation type is a true close, not reload
  const isReload = performance.getEntriesByType("navigation")[0]?.type === "reload";

  // If it's not a reload (so user is actually leaving)
  if (!isReload) {
    try {
      navigator.sendBeacon("/disconnect", JSON.stringify({ room: roomName, usernameHTML }));
      localStorage.removeItem("usernameHTML");
    } catch (err) {
      console.warn("Beacon failed:", err);
      localStorage.removeItem("usernameHTML");
    }
  }

  if (ws.readyState === WebSocket.OPEN) {
    ws.close();
  }
});
