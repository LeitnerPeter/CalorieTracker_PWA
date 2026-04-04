import { getTodayCalories } from "../services/calorieService.js";
import { DAILY_GOAL } from "../services/userService.js";
import { openAddMealScreen } from "./addMealScreen.js";
import { drawProgressRing } from "../modules/ui/progressRing.js";

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