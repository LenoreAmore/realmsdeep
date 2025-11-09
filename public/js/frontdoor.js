document.addEventListener("DOMContentLoaded", () => {
  const roomName = decodeURIComponent(window.location.pathname.split("/").pop());
  const identityInput = document.getElementById("identity-input");
  const enterBtn = document.getElementById("enter-btn");

  // Load previously saved identity for this session if available
  const sessionKey = `identityBlock_${roomName}`;
  const savedIdentity = sessionStorage.getItem(sessionKey);
  if (savedIdentity) identityInput.value = savedIdentity;

  enterBtn.addEventListener("click", () => {
    const identityHTML = identityInput.value.trim() || "[Unknown Identity]";

    // Save identity in sessionStorage only for this room
    sessionStorage.setItem(sessionKey, identityHTML);

    // Mark that user came via frontdoor (to show entrance message)
    sessionStorage.setItem(`viaFrontdoor_${roomName}`, true);

    // Redirect to room page
    window.location.href = `/room/${roomName}`;
  });

  // Optional: allow pressing Enter to trigger enter
  identityInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      enterBtn.click();
    }
  });
});
