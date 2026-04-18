import { addEntry } from "/services/entryService.js";
import { renderDashboard } from "/screens/dashboard.js";

// Temporäre LocalStorage Rezepte (Supabase später)
function getRecipes() {
  return JSON.parse(localStorage.getItem("recipes")) || [];
}

export function saveRecipe(recipe) {
  const recipes = getRecipes();
  recipes.push(recipe);
  localStorage.setItem("recipes", JSON.stringify(recipes));
}

// ⭐ FEHLENDER EXPORT
export function openRecipes() {
  const recipes = getRecipes();

  document.body.innerHTML = `
    <div class="screen">
      <h1>Rezepte</h1>
      <button id="backBtn">← Zurück</button>
      <div id="recipeList"></div>
    </div>
  `;

  document.getElementById("backBtn").onclick = () => history.back();

  const container = document.getElementById("recipeList");

  if (recipes.length === 0) {
    container.innerHTML = "<p>Noch keine Rezepte gespeichert 🍳</p>";
    return;
  }

  recipes.forEach(recipe => {
    const div = document.createElement("div");
    div.className = "food-card";
    div.innerHTML = `
      <strong>${recipe.name}</strong>
      <p>${recipe.kcal} kcal gesamt</p>
      <button>Hinzufügen</button>
    `;

    div.querySelector("button").onclick = async () => {
      await addEntry({
        food_name: recipe.name,
        grams: recipe.grams || 1,
        kcal: recipe.kcal
      });

      renderDashboard();
    };

    container.appendChild(div);
  });
}