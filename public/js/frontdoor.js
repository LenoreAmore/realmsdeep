document.addEventListener("DOMContentLoaded", () => {
  const identityInput = document.getElementById("identity-block");
  const entranceInput = document.getElementById("entrance-msg");
  const roomBanner = document.getElementById("room-banner");
  const roomDesc = document.getElementById("room-desc");
  const enterBtn = document.getElementById("enter-room-btn");

  // Get room name from URL path or default to "Apocalyptica"
  const roomName = decodeURIComponent(window.location.pathname.split("/").pop()) || "Apocalyptica";

  // Load admin room info if available
  const rooms = JSON.parse(localStorage.getItem("adminRooms")) || [];
  const room = rooms.find(r => r.name === roomName);

  // Prefill inputs with sessionStorage (tab-specific) first, then localStorage (global fallback), then room defaults
  identityInput.value =
    sessionStorage.getItem("identityBlock") ||
    localStorage.getItem("identityBlock") ||
    room?.identity ||
    "[Unknown Identity]";

  entranceInput.value =
    sessionStorage.getItem("entranceMessage") ||
    localStorage.getItem("entranceMessage") ||
    room?.entrance ||
    "enters the room";

  roomBanner.src = room?.banner || "/images/default-banner.jpg";
  roomDesc.textContent = room?.desc || "This room has no description yet.";

  enterBtn.addEventListener("click", () => {
    const identity = identityInput.value.trim() || "[Unknown Identity]";
    const entrance = entranceInput.value.trim() || "enters the room";

    // --- Save identity per tab BEFORE redirect ---
    sessionStorage.setItem("identityBlock", identity);
    sessionStorage.setItem("entranceMessage", entrance);

    // Fallback to localStorage only if none exists
    if (!localStorage.getItem("identityBlock")) {
      localStorage.setItem("identityBlock", identity);
      localStorage.setItem("entranceMessage", entrance);
    }

    // Flag that user came via frontdoor for entrance message
    sessionStorage.setItem(`viaFrontdoor_${roomName}`, "true");

    // Redirect to chatroom immediately
    window.location.href = `/room/${encodeURIComponent(roomName)}`;
  });
});
