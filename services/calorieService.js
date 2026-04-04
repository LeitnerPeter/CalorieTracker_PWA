import { getTodayEntries } from "./entryService.js";

export async function getTodayCalories() {
  const entries = await getTodayEntries();
  return entries.reduce((sum, e) => sum + e.kcal, 0);
}