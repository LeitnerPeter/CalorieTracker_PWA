import { addEntry } from "/services/entryService.js";
import { renderDashboard } from "/screens/dashboard.js";

// Temporäre LocalStorage Favoriten (Supabase später)
function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

export function saveFavorite(food) {
  const favorites = getFavorites();
  favorites.push(food);
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

// ⭐ DAS FEHLTE → Export!
export function openFavorites() {
  const favorites = getFavorites();

  document.body.innerHTML = `
    <div class="screen">
      <h1>Favoriten</h1>
      <button id="backBtn">← Zurück</button>
      <div id="favList"></div>
    </div>
  `;

  document.getElementById("backBtn").onclick = () => history.back();

  const container = document.getElementById("favList");

  if (favorites.length === 0) {
    container.innerHTML = "<p>Noch keine Favoriten gespeichert ⭐</p>";
    return;
  }

  favorites.forEach(food => {
    const div = document.createElement("div");
    div.className = "food-card";
    div.innerHTML = `
      <strong>${food.name}</strong>
      <p>${food.kcal} kcal / 100g</p>
      <button>Hinzufügen</button>
    `;

    div.querySelector("button").onclick = async () => {
      const grams = 100;
      const kcal = (food.kcal / 100) * grams;

      await addEntry({
        food_name: food.name,
        grams,
        kcal
      });

      renderDashboard();
    };

    container.appendChild(div);
  });
}