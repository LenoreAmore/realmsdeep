document.addEventListener("DOMContentLoaded", () => {
  const identityInput = document.getElementById("identity-block");
  const entranceInput = document.getElementById("entrance-msg");
  const roomBanner = document.getElementById("room-banner");
  const roomDesc = document.getElementById("room-desc");
  const enterBtn = document.getElementById("enter-room-btn");

  // Get room name from URL path or default to "Apocalyptica"
  const roomName = decodeURIComponent(window.location.pathname.split("/").pop()) || "Apocalyptica";
  sessionStorage.setItem("roomName", roomName); // use sessionStorage

  // Load admin room info if available
  const rooms = JSON.parse(localStorage.getItem("adminRooms")) || [];
  const room = rooms.find(r => r.name === roomName);

  // Prefill banner, description, identity, and entrance message
  roomBanner.src = room?.banner || "/images/default-banner.jpg";
  roomDesc.textContent = room?.desc || "This room has no description yet.";
  identityInput.value = room?.identity || "[Unknown Identity]";
  entranceInput.value = room?.entrance || "enters the room";

  // Enter Room button click handler
  enterBtn.addEventListener("click", () => {
    const identity = identityInput.value.trim() || "[Unknown Identity]";
    const entrance = entranceInput.value.trim() || "enters the room";

    // Save to sessionStorage so each tab has its own identity
    sessionStorage.setItem("identityBlock", identity);
    sessionStorage.setItem("entranceMessage", entrance);

    if (room?.moods) {
      sessionStorage.setItem("roomMoods", JSON.stringify(room.moods));
    }

    // --- Set front door flag for room.js to show entrance message ---
    sessionStorage.setItem(`viaFrontdoor_${roomName}`, "true");

    // --- Redirect to chatroom ---
    setTimeout(() => {
      window.location.href = `/room/${encodeURIComponent(roomName)}`;
    }, 50);
  });
});
