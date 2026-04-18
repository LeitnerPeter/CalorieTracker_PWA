import { openFoodSearch } from "/modules/meals/foodSearch.js";
import { openFavorites } from "/modules/meals/favourites.js";
import { openRecipes } from "/modules/meals/recipes.js";
import { startScanner } from "/modules/scanner/barcodeScanner.js";
import { navigateTo } from "/modules/core/navigation.js";

export function openAddMealScreen() {
  document.body.innerHTML = `
    <div class="add-meal-screen">
      <h2>Mahlzeit hinzufügen</h2>

      <button id="favBtn">⭐ Favoriten</button>
      <button id="recipesBtn">🍳 Mahlzeiten</button>
      <button id="searchBtn">🔍 Suche</button>
      <button id="scanBtn">📷 Barcode</button>
    </div>
  `;
  document.getElementById("favBtn").onclick = openFavorites;
  document.getElementById("recipesBtn").onclick = openRecipes;
  document.getElementById("searchBtn").onclick = openFoodSearch;
  document.getElementById("scanBtn").onclick = startScanner;
}