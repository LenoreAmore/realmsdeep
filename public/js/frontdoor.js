document.addEventListener("DOMContentLoaded", () => {
  const identityInput = document.getElementById("identity-block");
  const entranceInput = document.getElementById("entrance-msg");
  const roomBanner = document.getElementById("room-banner");
  const roomDesc = document.getElementById("room-desc");
  const enterBtn = document.getElementById("enter-room-btn");

  const roomName = decodeURIComponent(window.location.pathname.split("/").pop()) || "Apocalyptica";
  sessionStorage.setItem("roomName", roomName); // store current room for this tab

  const rooms = JSON.parse(localStorage.getItem("adminRooms")) || [];
  const room = rooms.find(r => r.name === roomName);

  // Prefill banner, description, identity, entrance message
  roomBanner.src = room?.banner || "/images/default-banner.jpg";
  roomDesc.textContent = room?.desc || "This room has no description yet.";
  identityInput.value = room?.identity || "[Unknown Identity]";
  entranceInput.value = room?.entrance || "enters the room";

  enterBtn.addEventListener("click", () => {
    const identity = identityInput.value.trim() || "[Unknown Identity]";
    const entrance = entranceInput.value.trim() || "enters the room";

    // --- Save full HTML per tab ---
    sessionStorage.setItem("identityBlock", identity);
    sessionStorage.setItem("entranceMessage", entrance);

    // --- Update localStorage default for future tabs ---
    localStorage.setItem("identityBlock", identity);
    localStorage.setItem("entranceMessage", entrance);

    // Flag that user came via frontdoor
    sessionStorage.setItem(`viaFrontdoor_${roomName}`, "true");

    // Redirect to room
    window.location.href = `/room/${encodeURIComponent(roomName)}`;
  });
});
