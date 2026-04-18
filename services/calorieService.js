import { getTodayEntries } from "/services/entryService.js";
import { getWeeklyMeals } from "/services/calorieService.js";

export async function getTodayCalories() {
  const entries = await getTodayEntries();
  return entries.reduce((sum, e) => sum + e.kcal, 0);
}

export async function getWeeklyMeals(date) {
  // supabase query
}