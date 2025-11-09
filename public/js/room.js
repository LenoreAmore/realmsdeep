document.addEventListener("DOMContentLoaded", () => {
  const roomName = decodeURIComponent(window.location.pathname.split("/").pop());
  const fullIdentityHTML = localStorage.getItem("identityBlock") || "[Unknown Identity]";
  const entranceMessage = localStorage.getItem("entranceMessage") || "enters the room";

  const chatLog = document.querySelector(".chat-log");
  const postToDropdown = document.getElementById("post-to");
  const moodDropdown = document.getElementById("mood");
  const messageBox = document.getElementById("message-box");
  const sendBtn = document.getElementById("send-btn");

  function extractDisplayName(html) {
    const match = html?.match(/\[[^\]]+\]/);
    return match ? match[0] : html || "[User]";
  }

  document.getElementById("room-name").textContent = roomName.toUpperCase();
  document.getElementById("static-identity-display").textContent = extractDisplayName(fullIdentityHTML);

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

  function appendMessage(identityHTML, mood, postTo, message, isAction = false) {
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
    chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: "smooth" });
  }

  const socket = new WebSocket(`ws://${window.location.host}`);

  socket.addEventListener("open", () => {
    socket.send(JSON.stringify({ type: "join", room: roomName }));
    socket.send(JSON.stringify({ type: "entrance", room: roomName, identityHTML: fullIdentityHTML, message: entranceMessage }));
  });

  socket.addEventListener("message", e => {
    const data = JSON.parse(e.data);
    if (data.room !== roomName) return;
    appendMessage(data.identityHTML, data.mood || "", data.postTo || "", data.message, data.type === "entrance");
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
});
