document.addEventListener("DOMContentLoaded", () => {
  const roomName = decodeURIComponent(window.location.pathname.split("/").pop());

  // Read identity & entrance from URL first, then sessionStorage, then fallback
  const urlParams = new URLSearchParams(window.location.search);
  const fullIdentityHTML = urlParams.get("identity") || sessionStorage.getItem("identityBlock") || "[Unknown Identity]";
  const entranceMessage = urlParams.get("entrance") || sessionStorage.getItem("entranceMessage") || "enters the room";

  // Save them to sessionStorage so refreshes keep the same name
  sessionStorage.setItem("identityBlock", fullIdentityHTML);
  sessionStorage.setItem("entranceMessage", entranceMessage);

  const chatLog = document.querySelector(".chat-log");
  const postToDropdown = document.getElementById("post-to");
  const moodDropdown = document.getElementById("mood");
  const messageBox = document.getElementById("message-box");
  const sendBtn = document.getElementById("send-btn");

  const STORAGE_KEY = `chatHistory_${roomName}`;
  const HISTORY_COUNT = parseInt(localStorage.getItem("historyCount")) || 10;

  function extractDisplayName(html) {
    if (!html) return "[User]";
    const match = html.match(/\[.*?\]/);
    if (match) return match[0];
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    const lines = tmp.innerText.split("\n").map(l => l.trim()).filter(Boolean);
    return lines.length ? lines[0] : "[User]";
  }

  const displayName = extractDisplayName(fullIdentityHTML);
  document.getElementById("room-name").textContent = roomName.toUpperCase();
  document.getElementById("static-identity-display").textContent = displayName;

  // Populate dropdowns
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
      msgDiv.innerHTML = `<div class="chat-identity">${identityHTML}</div><div class="chat-action"><i>${message}</i></div>`;
    } else {
      msgDiv.innerHTML = `<div class="chat-identity">${identityHTML}</div><div class="chat-body"><b>${mood} to ${postTo}:</b> ${message}</div>`;
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
  }

  // WebSocket setup
  const socket = new WebSocket(
    window.location.protocol === "https:"
      ? `wss://${window.location.host}`
      : `ws://${window.location.host}`
  );

  socket.addEventListener("open", () => {
    console.log("Connected to WebSocket server.");
    socket.send(JSON.stringify({ type: "join", room: roomName }));

    // Show entrance message if user came via frontdoor
    if (!sessionStorage.getItem(`entered_${roomName}`)) {
      socket.send(JSON.stringify({
        type: "entrance",
        room: roomName,
        identityHTML: fullIdentityHTML,
        message: entranceMessage
      }));
      sessionStorage.setItem(`entered_${roomName}`, "true");
    }
  });

  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    if (data.room !== roomName) return;
    appendMessage(data.identityHTML, data.mood || "", data.postTo || "", data.message, false, true, data.type === "entrance");
  });

  // Send chat message
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

    socket.send(JSON.stringify(messageData));
    messageBox.value = "";
    messageBox.focus();
  }
