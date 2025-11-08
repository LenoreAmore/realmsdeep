document.addEventListener("DOMContentLoaded", () => {
  const identityInput = document.getElementById("identity-block");
  const entranceInput = document.getElementById("entrance-msg");
  const roomBanner = document.getElementById("room-banner");
  const roomDesc = document.getElementById("room-desc");
  const enterBtn = document.getElementById("enter-room-btn");

  // Get room name from URL path or default to "Apocalyptica"
  const roomName = decodeURIComponent(window.location.pathname.split("/").pop()) || "Apocalyptica";
  sessionStorage.setItem("roomName", roomName); // store current room for this tab

  // Load admin room info if available
  const rooms = JSON.parse(localStorage.getItem("adminRooms")) || [];
  const room = rooms.find(r => r.name === roomName);

  // Prefill banner, description, identity, and entrance message
  roomBanner.src = room?.banner || "/images/default-banner.jpg";
  roomDesc.textContent = room?.desc || "This room has no description yet.";
  identityInput.value = room?.identity || "[Unknown Identity]";
  entranceInput.value = room?.entrance || "enters the room";

  enterBtn.addEventListener("click", () => {
    const identity = identityInput.value.trim() || "[Unknown Identity]";
    const entrance = entranceInput.value.trim() || "enters the room";

    // --- Save identity per tab ---
    sessionStorage.setItem("identityBlock", identity);
    sessionStorage.setItem("entranceMessage", entrance);

    // --- Keep a default copy globally in localStorage as fallback ---
    if (!localStorage.getItem("identityBlock")) {
      localStorage.setItem("identityBlock", identity);
      localStorage.setItem("entranceMessage", entrance);
    }

    if (room?.moods) {
      sessionStorage.setItem("roomMoods", JSON.stringify(room.moods));
    }

    // Flag that user came via frontdoor
    sessionStorage.setItem(`viaFrontdoor_${roomName}`, "true");

    // Redirect to chatroom
    setTimeout(() => {
      window.location.href = `/room/${encodeURIComponent(roomName)}`;
    }, 50);
  });
});
