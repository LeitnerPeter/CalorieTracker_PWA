const supabaseUrl = "https://xyakkemkejxnpdzopmbb.supabase.co";
const supabaseKey = "sb_publishable_ZzFGVRc3XUU7QnFR364VQg_UwAmO1Zm";

const supabaseClient = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

console.log("Supabase initialized");

let pendingEntries =
  JSON.parse(localStorage.getItem("pendingEntries")) || [];

// ===== Food presets (can be extended anytime) =====
let foods = [];

document
  .querySelectorAll(".portion-buttons button")
  .forEach(button => {

    button.addEventListener("click", () => {

      document
        .querySelectorAll(".portion-buttons button")
        .forEach(b => b.classList.remove("active"));

      button.classList.add("active");

      selectedMultiplier = parseFloat(
        button.dataset.multiplier
      );

    });

});

// ===== DOM Elements =====
const foodSelect = document.getElementById("foodSelect");
const entriesList = document.getElementById("entriesList");
const totalCaloriesEl = document.getElementById("totalCalories");
const currentDateEl = document.getElementById("currentDate");
const foodSearch = document.getElementById("foodSearch");
const foodResults = document.getElementById("foodResults");

console.log("foodSearch element:", foodSearch);
console.log("foodResults element:", foodResults);

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
function initApp() {

  loadFoods();
  renderEntries();
  syncPendingEntries();

}

let selectedFood = null;

foodSearch.addEventListener("input", () => {

  const query = foodSearch.value.toLowerCase();

  foodResults.innerHTML = "";

  if (query.length < 1) return;

  const filtered = foods.filter(food =>
    food.name.toLowerCase().includes(query)
  );

  filtered.slice(0, 10).forEach(food => {

    const li = document.createElement("li");
    li.textContent = food.name;

    li.addEventListener("click", () => {

      selectedFood = food;

      foodSearch.value = food.name;
      foodResults.innerHTML = "";

    });

    foodResults.appendChild(li);

  });

});

// ===== Add entry =====
document.getElementById("addEntryBtn").addEventListener("click", async () => {

  if (!selectedFood) {
    alert("Select a food first");
    return;
  }

  const itemId = selectedFood.id;

  const item = foods.find(f => f.id === itemId);

  if (!item) return;

  const amount = selectedFood.default_portion * selectedMultiplier;

  const newEntry = {
    date: selectedDate,
    item_id: itemId,
    amount: amount
  };

  console.log("Item:", item);
  console.log("Multiplier:", selectedMultiplier);
  console.log("Amount:", amount);

  const { error } = await supabaseClient
    .from("entries")
    .insert([newEntry]);

  if (error) {
    console.error("Insert error:", error);
  } else {
    renderEntries();
  }

});

// ===== Render =====
async function renderEntries() {

  entriesList.innerHTML = "";
  currentDateEl.textContent = formatDate(selectedDate);

  const { data, error } = await supabaseClient
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

  const { error } = await supabaseClient
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

async function loadFoods() {

  console.log("Loading foods...");
  console.log("foodResults:", foodResults);

  const { data, error } = await supabaseClient
    .from("items")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error loading foods", error);
    return;
  }

  foods = data;

  const select = document.getElementById("foodSelect");
  select.innerHTML = "";

  foods.forEach((food, index) => {

    const option = document.createElement("option");

    option.value = food.id;
    option.textContent = food.name;

    select.appendChild(option);

  });

}

console.log("Add listener registered");
window.addEventListener("load", syncPendingEntries);
window.addEventListener("online", syncPendingEntries);

window.addEventListener("load", async () => {

  await loadFoods();

  syncPendingEntries();

  renderEntries();

});