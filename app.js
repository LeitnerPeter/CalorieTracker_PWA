import { renderDashboard } from "/screens/dashboard.js";
import { getCache, setCache } from "/modules/core/cache.js";
import { openAddMealScreen } from "/screens/addMealScreen.js";

document.addEventListener("DOMContentLoaded", async () => {
  renderDashboard();
  loadWeeklyChart();
});


window.startFoodScanner = () => {
  startScanner(async (food) => {
    const grams = Number(
      document.getElementById("grams-input").value || 100
    );

    await addMeal(food, grams);
    location.reload();
  });
};

document
  .getElementById("add-meal-btn")
  .addEventListener("click", openAddMealScreen);

async function loadWeeklyChart() {

  let data = getCache();

  if (!data) {
    data = await getWeeklyMeals(getLastWeekDate());
    setCache(data);
  }

  renderChart(data);
}