const supabaseUrl = "https://xyakkemkejxnpdzopmbb.supabase.co";
const supabaseKey = "sb_publishable_ZzFGVRc3XUU7QnFR364VQg_UwAmO1Zm";

const supabaseClient = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);

console.log("Supabase initialized");
console.log("Supabase:", supabase);

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
const favoritesList = document.getElementById("favoritesList");
const connectionStatus = document.getElementById("connectionStatus");
const mainElement = document.querySelector("main");

let entriesByDate = JSON.parse(localStorage.getItem("entriesByDate")) || {};
let selectedMultiplier = 1;
let selectedDate = getToday();
let weeklyChart = null;
let lastEntryId = null;
let searchTimeout = null;

currentDateEl.textContent = formatDate(selectedDate);

document.getElementById("prevDay").addEventListener("click", () => {
  changeDate(-1);
});

document.getElementById("nextDay").addEventListener("click", () => {
  changeDate(1);
});

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

  const { error } = await supabaseClient
    .from("entries")
    .insert([newEntry]);

  if (error) {
    console.error("Insert error:", error);
  } else {
    renderEntries();
  }

});

// Undo Button
document.getElementById("undoBtn").addEventListener("click", async () => {

  if (!lastEntryId) return;

  await supabaseClient
    .from("entries")
    .delete()
    .eq("id", lastEntryId);

  lastEntryId = null;

  setTimeout(() => {
    document.getElementById("undoBar").hidden = true;
  }, 5000);

  renderEntries();

});

let touchStartX = 0;
let touchEndX = 0;

mainElement.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].screenX;
});

mainElement.addEventListener("touchend", (event) => {
  touchEndX = event.changedTouches[0].screenX;
  handleSwipe();
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

  renderWeeklyChart();
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

function saveRecentFood(food) {

  let recent = JSON.parse(localStorage.getItem("recentFoods")) || [];

  recent = recent.filter(f => f.id !== food.id);

  recent.unshift(food);

  localStorage.setItem("recentFoods", JSON.stringify(recent));

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

function renderFavorites() {

  favoritesList.innerHTML = "";

  const favorites = foods.filter(food => food.is_favorite);

  favorites.forEach(food => {

    const btn = document.createElement("button");

    btn.textContent = food.name;

    btn.addEventListener("click", () => {

      selectedFood = food;

      addEntryFromFavorite(food);

    });

    favoritesList.appendChild(btn);

  });

}

async function addEntryFromFavorite(food) {

  const amount = food.default_portion * selectedMultiplier;

  const { data, error } = await supabaseClient
    .from("entries")
    .insert([{
      date: selectedDate,
      item_id: food.id,
      amount: amount
    }])
    .select();

  if (error) {
    console.error(error);
    return;
  }

  lastEntryId = data[0].id;

  document.getElementById("undoBar").hidden = false;

  renderEntries();

}

async function loadFoods() {

  const { data, error } = await supabaseClient
    .from("items")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error loading foods", error);
    return;
  }

  foods = data;

  console.log("Foods loaded:", foods.length);

}

function updateConnectionStatus() {

  if (navigator.onLine) {

    connectionStatus.textContent = "🟢 Online";
    connectionStatus.classList.remove("offline");
    connectionStatus.classList.add("online");

  } else {

    connectionStatus.textContent = "🔴 Offline";
    connectionStatus.classList.remove("online");
    connectionStatus.classList.add("offline");

  }

}

function renderRecentFoods() {

  const container = document.getElementById("recentFoods");

  const recent = JSON.parse(localStorage.getItem("recentFoods")) || [];

  container.innerHTML = "";

  recent.slice(0,5).forEach(food => {

    const btn = document.createElement("button");
    btn.textContent = food.name;

    btn.onclick = () => addEntryFromFavorite(food);

    container.appendChild(btn);

  });

}

function handleSwipe() {

  const swipeDistance = touchEndX - touchStartX;
  const threshold = 50;

  if (swipeDistance > threshold) {

    // swipe right → gestern
    mainElement.classList.add("swipe-right");

    setTimeout(() => {
      changeDate(-1);
      mainElement.classList.remove("swipe-right");
    }, 150);

  }

  if (swipeDistance < -threshold) {

    // swipe left → morgen
    mainElement.classList.add("swipe-left");

    setTimeout(() => {
      changeDate(1);
      mainElement.classList.remove("swipe-left");
    }, 150);
  }
}

async function renderWeeklyChart(labels, calories) {

  const data = await getWeeklyCalories();
  renderChart(data);

  if (weeklyChart) {
    weeklyChart.destroy();
  }

  weeklyChart = new Chart(
    document.getElementById("weeklyChart"),
    {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Calories",
          data: calories
        }]
      }
    }
  );
}

function handleSearchInput(value) {
  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {
    performFoodSearch(value);
  }, 300);
}

function performFoodSearch(query) {
  const results = foods.filter(f =>
    f.name.toLowerCase().includes(query.toLowerCase())
  );

  renderFoodResults(results);
}

async function getWeeklyCalories() {

  const cache = localStorage.getItem("weeklyCaloriesCache");

  if (cache) {
    const parsed = JSON.parse(cache);

    if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
      return parsed.data;
    }
  }

  const { data } = await supabaseClient
    .from("meals")
    .select("calories, date")
    .get("date", getLastWeekDate());

  localStorage.setItem("weeklyCaloriesCache", JSON.stringify({
    timestamp: Date.now(),
    data: data
  }));

  return data;
}

async function startScanner() {
  const video = document.getElementById("scanner");
  video.style.display = "block";

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" }
  });

  video.srcObject = stream;
  video.setAttribute("playsinline", true);
  video.play();

  scanBarcode(video);
}

async function scanBarcode(video) {
  const barcodeDetector = new BarcodeDetector({
    formats: ["ean_13", "ean_8"]
  });

  const interval = setInterval(async () => {
    const barcodes = await barcodeDetector.detect(video);

    if (barcodes.length > 0) {
      clearInterval(interval);

      const code = barcodes[0].rawValue;
      fetchFoodFromBarcode(code);

      video.srcObject.getTracks().forEach(track => track.stop());
      video.style.display = "none";
    }
  }, 500);
}

async function fetchFoodFromBarcode(barcode) {
  const res = await fetch(
    `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
  );

  const json = await res.json();

  if (json.status === 1) {
    const product = json.product;

    const food = {
      name: product.product_name || "Unknown",
      calories: product.nutriments["energy-kcal_100g"] || 0
    };

    addFood(food);
  } else {
    alert("Produkt nicht gefunden 😕");
  }
}

function setCalorieGoal(value) {
  localStorage.setItem("calorieGoal", value);
}

function getCalorieGoal() {
  return Number(localStorage.getItem("calorieGoal")) || 2000;
}

function getTodayCalories(meals) {
  const today = new Date().toISOString().split("T")[0];

  return meals
    .filter(m => m.date === today)
    .reduce((sum, m) => sum + m.calories, 0);
}

function renderCalorieStatus(meals) {
  const goal = getCalorieGoal();
  const consumed = getTodayCalories(meals);

  if (consumed > goal) {
    status.style.color = "red";
  }

  document.getElementById("calorie-status").innerText =
    `${consumed} / ${goal} kcal`;
}

function showInstallHint() {
  if (window.navigator.standalone) return;

  alert("👉 Tippe auf 'Teilen' und dann 'Zum Home-Bildschirm'");
}


console.log("Add listener registered");
window.addEventListener("load", syncPendingEntries);
window.addEventListener("online", syncPendingEntries);

window.addEventListener("load", async () => {

  await loadFoods();

  renderFavorites();

  syncPendingEntries();

  renderEntries();

});

window.addEventListener("online", () => {

  updateConnectionStatus();
  syncPendingEntries();

});
window.addEventListener("offline", updateConnectionStatus);
window.addEventListener("load", updateConnectionStatus);