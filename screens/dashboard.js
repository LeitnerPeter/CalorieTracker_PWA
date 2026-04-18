import { getTodayCalories } from "/services/calorieService.js";
import { DAILY_GOAL } from "/services/userService.js";
import { openAddMealScreen } from "/screens/addMealScreen.js";
import { drawProgressRing } from "/modules/ui/progressRing.js";

export async function renderDashboard() {
  const eaten = await getTodayCalories();
  const remaining = DAILY_GOAL - eaten;
  const percent = Math.min((eaten / DAILY_GOAL) * 100, 100);

  document.body.innerHTML = `
    <div class="dashboard">
      <h1>Tagesübersicht</h1>

      <div class="progress-wrapper">
        <canvas id="progressRing" width="200" height="200"></canvas>
        <div class="progress-text">
          <h2>${eaten}</h2>
          <p>/ ${DAILY_GOAL} kcal</p>
        </div>
      </div>

      <h3>Verbleibend: ${remaining} kcal</h3>

      <button id="addMealBtn">+ Mahlzeit hinzufügen</button>

      <div id="mealList"></div>
    </div>
  `;

  drawProgressRing(percent);
  document.getElementById("addMealBtn").onclick = openAddMealScreen;
}

function renderMealList(entries) {
  const container = document.getElementById("mealList");
  if (!container) return;

  container.innerHTML = "<h3>Heute gegessen</h3>";

  if (entries.length === 0) {
    container.innerHTML += "<p>Noch nichts eingetragen</p>";
    return;
  }

  entries.forEach(entry => {
    const div = document.createElement("div");
    div.className = "meal-entry";
    div.innerHTML = `
      ${entry.food_name} • ${entry.grams}g • ${entry.kcal} kcal
    `;
    container.appendChild(div);
  });
}