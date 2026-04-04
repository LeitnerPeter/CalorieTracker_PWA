import { supabaseClient } from "./supabase.js";
import { calculateCalories, getTodayDate } from "./calories.js";

export async function addMeal(food, grams) {
  const calories = calculateCalories(food.calories, grams);

  const { error } = await supabaseClient
    .from("items")
    .insert({
      name: food.name,
      kcal_per_100: food.calories,
      grams,
      calories,
      date: getTodayDate()
    });

  if (error) console.error(error);
}

export async function getWeeklyMeals(lastWeekDate) {
  const { data, error } = await supabaseClient
    .from("items")
    .select("calories, date")
    .gte("date", lastWeekDate);

  if (error) {
    console.error(error);
    return [];
  }

  return data || [];
}