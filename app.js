// ===== Food presets (can be extended anytime) =====
const foods = [
  { name: "Pizza Margherita", kcalPer100g: 240, defaultPortion: 300 },
  { name: "Pasta Bolognese", kcalPer100g: 160, defaultPortion: 350 },
  { name: "Burger", kcalPer100g: 260, defaultPortion: 280 },
  { name: "Hotel Buffet Plate", kcalPer100g: 180, defaultPortion: 500 },
  { name: "Salad with Dressing", kcalPer100g: 120, defaultPortion: 250 },
  { name: "Cocktail", kcalPer100g: 150, defaultPortion: 250 }
];

// ===== DOM Elements =====
const foodSelect = document.getElementById("foodSelect");
const entriesList = document.getElementById("entriesList");
const totalCaloriesEl = document.getElementById("totalCalories");
const currentDateEl = document.getElementById("currentDate");

let entriesByDate = JSON.parse(localStorage.getItem("entriesByDate")) || {};
let selectedMultiplier = 1;
let selectedDate = getToday();

currentDateEl.textContent = formatDate(selectedDate);

document.getElementById("prevDay").addEventListener("click", () => {
  changeDate(-1);
});

document.getElementById("nextDay").addEventListener("click", () => {
  changeDate(1);
});


// ===== Init =====
foods.forEach((food, index) => {
  const option = document.createElement("option");
  option.value = index;
  option.textContent = food.name;
  foodSelect.appendChild(option);
});

renderEntries();

// ===== Portion buttons =====
document.getElementById("addEntryBtn").addEventListener("click", () => {

  const selectedIndex = parseInt(foodSelect.value);
  const food = foods[selectedIndex];

  if (!food) return;

  const grams = food.defaultPortion * selectedMultiplier;
  const calories = Math.round((food.kcalPer100g / 100) * grams);

  if (!entriesByDate[selectedDate]) {
    entriesByDate[selectedDate] = [];
  }

  entriesByDate[selectedDate].push({
    name: food.name,
    calories: calories
  });

  localStorage.setItem("entriesByDate", JSON.stringify(entriesByDate));

  renderEntries();
});

// ===== Add entry =====
document.getElementById("addEntryBtn").addEventListener("click", () => {
  const food = foods[foodSelect.value];
  const grams = food.defaultPortion * selectedMultiplier;
  const calories = Math.round((food.kcalPer100g / 100) * grams);

  // Falls Datum noch nicht existiert → anlegen
  if (!entriesByDate[selectedDate]) {
    entriesByDate[selectedDate] = [];
  }

  // Eintrag hinzufügen
  entriesByDate[selectedDate].push({
    name: food.name,
    calories: calories
  });

  saveAndRender();
});

// ===== Render =====
function renderEntries() {
  entriesList.innerHTML = "";

  currentDateEl.textContent = formatDate(selectedDate);

  let total = 0;

  const entries = entriesByDate[selectedDate] || [];

  entries.forEach((entry, index) => {
    total += entry.calories;

    const li = document.createElement("li");
    li.innerHTML = `
      <span>${entry.name} – ${entry.calories} kcal</span>
      <button onclick="removeEntry(${index})">X</button>
    `;
    entriesList.appendChild(li);
  });

  totalCaloriesEl.textContent = total + " kcal";
}

function removeEntry(index) {
  entriesByDate[selectedDate].splice(index, 1);
  saveAndRender();
}

function saveAndRender() {
  localStorage.setItem(
    "entriesByDate",
    JSON.stringify(entriesByDate)
  );
  renderEntries();
}

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(dateString) {
  const options = { weekday: "short", day: "numeric", month: "short" };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

function changeDate(days) {
  const date = new Date(selectedDate);
  date.setDate(date.getDate() + days);
  selectedDate = date.toISOString().split("T")[0];
  renderEntries();
}