document.addEventListener("DOMContentLoaded", () => {
  const roomName = decodeURIComponent(window.location.pathname.split("/").pop());
  const fullIdentityHTML = localStorage.getItem("identityBlock") || "[Unknown Identity]";
  const entranceMessage = localStorage.getItem("entranceMessage") || "enters the room";

  const chatLog = document.querySelector(".chat-log");
  const postToDropdown = document.getElementById("post-to");
  const moodDropdown = document.getElementById("mood");
  const messageBox = document.getElementById("message-box");
  const sendBtn = document.getElementById("send-btn");

  const STORAGE_KEY = `chatHistory_${roomName}`;
  const HISTORY_COUNT = parseInt(localStorage.getItem("historyCount")) || 10;

  // ✅ Extract only the [ ... ] portion from the user’s HTML code
  function extractDisplayName(html) {
    if (!html) return "[User]";
    const match = html.match(/\[[^\]]+\]/); // grabs only the first [ ... ] block
    return match ? match[0] : "[User]";
  }

  const displayName = extractDisplayName(fullIdentityHTML);
  document.getElementById("room-name").textContent = roomName.toUpperCase();
  document.getElementById("static-identity-display").textContent = displayName;

  ["All", "Lenore", "Jonah", "Emilia"].forEach(u => {
    const opt = document.createElement("option");
    opt.value = u;
    opt.textContent = u;
    postToDropdown.appendChild(opt);
  });

  ["says", "whispers", "shouts", "laughs", "smiles"].forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    moodDropdown.appendChild(opt);
  });

  function appendMessage(identityHTML, mood, postTo, message, save = true, scroll = true, isAction = false) {
    if (!message) return;
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("chat-message");

    if (isAction) {
      msgDiv.innerHTML = `<div class="chat-identity">${extractDisplayName(identityHTML)}</div>
                          <div class="chat-action"><i>${message}</i></div>`;
    } else {
      msgDiv.innerHTML = `<div class="chat-identity">${extractDisplayName(identityHTML)}</div>
                          <div class="chat-body"><b>${mood} to ${postTo}:</b> ${message}</div>`;
    }

    chatLog.appendChild(msgDiv);

    if (scroll) {
      chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: "smooth" });
    }

    if (save) {
      let history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      history.push({ identityHTML, mood, postTo, message, isAction });
      if (history.length > 50) history = history.slice(-50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }
  }

  function loadHistory() {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const slice = history.slice(-HISTORY_COUNT);
    slice.forEach((m, i) => {
      const isLast = i === slice.length - 1;
      appendMessage(m.identityHTML, m.mood, m.postTo, m.message, false, isLast, !!m.isAction);
    });
    chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: "smooth" }); // ✅ autoscroll for 2nd window
  }

  // --- WebSocket setup ---
  const socket = new WebSocket(`ws://${window.location.host}`);

  socket.addEventListener("open", () => {
    console.log("Connected to WebSocket server.");
    // Join room
    socket.send(JSON.stringify({ type: "join", room: roomName }));
    // Send entrance message
    socket.send(JSON.stringify({
      type: "entrance",
      room: roomName,
      identityHTML: fullIdentityHTML,
      message: entranceMessage
    }));
  });

  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    if (data.room !== roomName) return;

    if (data.type === "entrance") {
      appendMessage(data.identityHTML, "", "", data.message, false, true, true);
    } else if (data.type === "message") {
      appendMessage(data.identityHTML, data.mood, data.postTo, data.message, false, true, false);
    }
  });

  function sendMessage() {
    const msg = messageBox.value.trim();
    if (!msg) return;

    const messageData = {
      type: "message",
      room: roomName,
      identityHTML: fullIdentityHTML,
      mood: moodDropdown.value,
      postTo: postToDropdown.value,
      message: msg
    };

    appendMessage(fullIdentityHTML, moodDropdown.value, postToDropdown.value, msg);
    socket.send(JSON.stringify(messageData));

    messageBox.value = "";
    messageBox.focus();
  }

  sendBtn.addEventListener("click", sendMessage);
  messageBox.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  loadHistory();
});
