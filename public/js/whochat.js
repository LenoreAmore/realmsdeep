document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("rooms-container");

  // Mock room data with genres
  const rooms = [
    { name: "Apocalyptica", leader: "Lenore", playerCount: 2, users: ["Lenore","Omen"], description: "Modern WoD setting.", banner: "/images/crypt-banner.jpg", genre: "Vampire" },
    { name: "The Velvet Crypt", leader: "Jonah Kelsay", playerCount: 3, users: ["Darcy","Jonah","Valerie"], description: "Gothic lounge for night dwellers.", banner: "/images/crypt-banner.jpg", genre: "Vampire" },
    { name: "The Starforge", leader: "Zara Orion", playerCount: 2, users: ["Eamon","Nova"], description: "Sci-fi mech pilots gather here.", banner: "/images/starforge-banner.jpg", genre: "Sci-Fi" },
    { name: "The Green Hollow", leader: "Ruby Lighteyes", playerCount: 4, users: ["Willow","Hayden","Eliza","Layla"], description: "Druids, elves, dreamers.", banner: "/images/greenhollow-banner.jpg", genre: "Fantasy" }
  ];

  // Group rooms by genre
  const genres = {};
  rooms.forEach(room => {
    if (!genres[room.genre]) genres[room.genre] = [];
    genres[room.genre].push(room);
  });

  // Modal elements
  const modal = document.getElementById("room-modal");
  const modalName = document.getElementById("modal-name");
  const modalDesc = document.getElementById("modal-desc");
  const modalBanner = document.getElementById("modal-banner");
  const span = document.querySelector(".close");

  span.onclick = () => modal.style.display = "none";
  window.onclick = e => { if (e.target == modal) modal.style.display = "none"; };

  // Build genre sections
  Object.keys(genres).forEach(genreName => {
    const section = document.createElement("div");
    section.className = "genre-section";

    const title = document.createElement("h2");
    title.className = "genre-title";
    title.textContent = genreName;
    section.appendChild(title);

    const genreRooms = document.createElement("div");
    genreRooms.className = "genre-rooms";

    genres[genreName].forEach(room => {
      const card = document.createElement("div");
      card.className = "room-card";

      const usersHTML = room.users.map(u => `<span>${u}</span>`).join(" ");

      card.innerHTML = `
        <h3>
          ${room.name}
          <i class="fa-solid fa-circle-info info-icon" title="Room Info"></i>
        </h3>
        <p><strong>Leader:</strong> ${room.leader}</p>
        <p><strong>Players:</strong> ${room.playerCount}</p>
        <div class="user-list">${usersHTML}</div>
        <button class="enter-btn">Enter Room</button>
      `;

      // Info modal click
      card.querySelector(".info-icon").addEventListener("click", () => {
        modal.style.display = "block";
        modalName.textContent = room.name;
        modalDesc.textContent = room.description;
        modalBanner.src = room.banner;
      });

      // Enter button click -> go to frontdoor
      card.querySelector(".enter-btn").addEventListener("click", () => {
        window.location.href = `/frontdoor/${encodeURIComponent(room.name)}`;
      });

      genreRooms.appendChild(card);
    });

    section.appendChild(genreRooms);
    container.appendChild(section);
  });
});
