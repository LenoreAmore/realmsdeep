document.addEventListener("DOMContentLoaded", () => {
  const loginContainer = document.getElementById("login-container");
  const dashboardContainer = document.getElementById("dashboard-container");
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const welcome = document.getElementById("welcome");
  const roomsList = document.getElementById("rooms-list");

  const editSection = document.getElementById("edit-section");
  const editRoomName = document.getElementById("edit-room-name");
  const editBanner = document.getElementById("edit-banner");
  const editDesc = document.getElementById("edit-desc");
  const editIdentity = document.getElementById("edit-identity");
  const editMoods = document.getElementById("edit-moods");
  const saveRoomBtn = document.getElementById("save-room-btn");
  const cancelEditBtn = document.getElementById("cancel-edit-btn");

  let currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  let currentRoom = null;

  // Load saved rooms from localStorage or default
  const defaultRooms = [
    { name: "Apocalyptica", banner: "/images/apocalyptica.jpg", desc: "Modern Gothic roleplay set in a neon-soaked Los Angeles.", identity: "[··· silver-tongued ···]", moods: ["says","whispers","shouts","laughs","smiles"] },
    { name: "The Velvet Den", banner: "/images/velvetden.jpg", desc: "Intimate vampire RP, dark and secretive.", identity: "[··· unknown ···]", moods: ["says","whispers","shouts","laughs","smiles"] },
    { name: "Unknown", banner: "/images/unknown.jpg", desc: "Experimental sci-fi RP with horror elements.", identity: "[··· unknown ···]", moods: ["says","whispers","shouts","laughs","smiles"] }
  ];

  let rooms = JSON.parse(localStorage.getItem("adminRooms") || "null") || defaultRooms;

  function saveRooms() {
    localStorage.setItem("adminRooms", JSON.stringify(rooms));
  }

  function showDashboard(user) {
    loginContainer.style.display = "none";
    dashboardContainer.style.display = "block";
    welcome.textContent = `Welcome, ${user.username} (${user.role})`;

    if (user.role === "leader") {
      roomsList.innerHTML = `<h3>Your Rooms:</h3>`;
      user.rooms.forEach(roomName => {
        const room = rooms.find(r => r.name === roomName);
        if (room) {
          const div = document.createElement("div");
          div.classList.add("room-card");
          div.textContent = room.name;
          div.addEventListener("click", () => openRoomEditor(room.name));
          roomsList.appendChild(div);
        }
      });
    } else {
      roomsList.innerHTML = "<p>You are not a room leader.</p>";
    }
  }

  function showLogin() {
    loginContainer.style.display = "block";
    dashboardContainer.style.display = "none";
  }

  function openRoomEditor(roomName) {
    currentRoom = rooms.find(r => r.name === roomName);
    if (!currentRoom) return;

    editRoomName.textContent = currentRoom.name;
    editBanner.value = currentRoom.banner;
    editDesc.value = currentRoom.desc;
    editIdentity.value = currentRoom.identity;
    editMoods.value = currentRoom.moods.join(",");
    editSection.style.display = "block";
    window.scrollTo(0, document.body.scrollHeight); // scroll to edit section
  }

  function closeRoomEditor() {
    editSection.style.display = "none";
    currentRoom = null;
  }

  // Login button
  loginBtn.addEventListener("click", () => {
    const username = document.getElementById("username").value.trim();
    const role = document.getElementById("role").value;
    const roomsInput = document.getElementById("rooms").value.trim();
    const userRooms = role === "leader" ? roomsInput.split(",").map(r => r.trim()) : [];

    if (!username) { alert("Please enter a username."); return; }

    currentUser = { username, role, rooms: userRooms };
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    showDashboard(currentUser);
  });

  // Save room changes
  saveRoomBtn.addEventListener("click", () => {
    if (!currentRoom) return;
    currentRoom.banner = editBanner.value;
    currentRoom.desc = editDesc.value;
    currentRoom.identity = editIdentity.value;
    currentRoom.moods = editMoods.value.split(",").map(m => m.trim());
    saveRooms();
    alert("Room updated!");
    closeRoomEditor();
  });

  cancelEditBtn.addEventListener("click", () => closeRoomEditor());

  // Logout
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    currentUser = null;
    showLogin();
  });

  // Initial load
  if (currentUser) showDashboard(currentUser);
});
