const supabaseUrl = "https://xyakkemkejxnpdzopmbb.supabase.co";
const supabaseKey = "DEIN_ANON_KEY";

const supabase = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);

let pendingEntries =
  JSON.parse(localStorage.getItem("pendingEntries")) || [];

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
document.getElementById("addEntryBtn").addEventListener("click", async () => {

  const selectedIndex = parseInt(foodSelect.value);
  const item = foods[selectedIndex];

  if (!item) return;

  const amount = item.defaultPortion * selectedMultiplier;

  const newEntry = {
    date: selectedDate,
    item_id: item.id,
    amount: amount
  };

  if (navigator.onLine) {
    const { error } = await supabase
      .from("entries")
      .insert([newEntry]);

    if (error) {
      console.log("Online failed, saving offline");
      saveOffline(newEntry);
    }
  } else {
    saveOffline(newEntry);
  }

  renderEntries();
});

// ===== Render =====
async function renderEntries() {

  entriesList.innerHTML = "";
  currentDateEl.textContent = formatDate(selectedDate);

  const { data, error } = await supabase
    .from("entries")
    .select(`
      id,
      amount,
      items (
        name,
        kcal_per_100
      )
    `)
    .eq("date", selectedDate);

  if (error) {
    console.error(error);
    return;
  }

  let total = 0;

  data.forEach(entry => {

    const calories = Math.round(
      (entry.items.kcal_per_100 / 100) * entry.amount
    );

    total += calories;

    const li = document.createElement("li");
    li.innerHTML = `
      <span>${entry.items.name} – ${calories} kcal</span>
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

function saveOffline(entry) {
  pendingEntries.push(entry);
  localStorage.setItem(
    "pendingEntries",
    JSON.stringify(pendingEntries)
  );
}

async function syncPendingEntries() {

  if (!navigator.onLine) return;
  if (pendingEntries.length === 0) return;

  console.log("Syncing pending entries...");

  const { error } = await supabase
    .from("entries")
    .insert(pendingEntries);

  if (!error) {
    pendingEntries = [];
    localStorage.removeItem("pendingEntries");
    console.log("Sync successful");
  }
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

window.addEventListener("load", syncPendingEntries);
window.addEventListener("online", syncPendingEntries);