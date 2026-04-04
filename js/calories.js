export function calculateCalories(kcalPer100, grams) {
  return Math.round((kcalPer100 / 100) * grams);
}

export function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

export function getLastWeekDate() {
  const d = new Date();
  d.setHours(0,0,0,0);
  d.setDate(d.getDate() - 7);
  return d.toISOString().split("T")[0];
}

export function getCalorieGoal() {
  return Number(localStorage.getItem("calorieGoal")) || 2000;
}