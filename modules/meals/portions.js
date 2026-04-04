import { addEntry } from "../../services/entryService.js";

export function openPortionSelector(food) {
  document.body.innerHTML = `
    <div class="portion-screen">
      <h2>${food.name}</h2>
      <p>${food.kcal_per_100} kcal pro 100g</p>

      <button onclick="selectPortion(50)">50g</button>
      <button onclick="selectPortion(100)">100g</button>
      <button onclick="selectPortion(150)">150g</button>
      <button onclick="selectPortion(200)">200g</button>

      <input id="customGrams" type="number" placeholder="Eigene Gramm" />
      <button id="customBtn">Hinzufügen</button>
    </div>
  `;

  window.selectPortion = (grams) => saveEntry(food, grams);

  document.getElementById("customBtn").onclick = () => {
    const grams = document.getElementById("customGrams").value;
    saveEntry(food, grams);
  };
}

async function saveEntry(food, grams) {
  const kcal = (food.kcal_per_100 / 100) * grams;

  await addEntry({
    food_id: food.id,
    grams: grams,
    kcal: Math.round(kcal)
  });

  alert("Eintrag gespeichert 🎉");
}