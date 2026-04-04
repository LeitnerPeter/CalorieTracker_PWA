import { getLastWeekDate } from "./calories.js";
import { getWeeklyMeals } from "./meals.js";
import { renderChart } from "./chart.js";
import { getCache, setCache } from "./cache.js";
import { startScanner } from "./scanner.js";
import { addMeal } from "./meals.js";


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