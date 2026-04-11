import { renderDashboard } from "/screens/dashboard.js";

document.addEventListener("DOMContentLoaded", () => {
  renderDashboard();
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

async function loadWeeklyChart() {

  let data = getCache();

  if (!data) {
    data = await getWeeklyMeals(getLastWeekDate());
    setCache(data);
  }

  renderChart(data);
}

loadWeeklyChart();