import { searchFood } from "/services/foodService.js";
import { openPortionSelector } from "/modules/meals/portions.js";

export function openFoodSearch() {
  document.body.innerHTML = `
    <div class="food-search">
      <input id="foodInput" placeholder="Lebensmittel suchen..." />
      <div id="results"></div>
    </div>
  `;

  document.getElementById("foodInput").addEventListener("input", async (e) => {
    const foods = await searchFood(e.target.value);
    renderResults(foods);
  });
}

function renderResults(foods) {
  const container = document.getElementById("results");
  container.innerHTML = "";

  foods.forEach(food => {
    const div = document.createElement("div");
    div.className = "food-item";
    div.innerHTML = `
      <b>${food.name}</b>
      <span>${food.kcal_per_100} kcal / 100g</span>
    `;

    div.onclick = () => openPortionSelector(food);
    container.appendChild(div);
  });
}
