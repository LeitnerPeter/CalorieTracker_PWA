import { supabase } from "/services/supabaseClient.js";

// 🔹 Heutige Einträge laden
export async function getTodayEntries() {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("date", today)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch entries error:", error);
    return [];
  }

  return data || [];
}

// 🔹 Neuer Eintrag hinzufügen  ⭐ DAS FEHLTE
export async function addEntry(entry) {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("entries")
    .insert([
      {
        food_name: entry.food_name,
        grams: entry.grams,
        kcal: entry.kcal,
        date: today
      }
    ])
    .select();

  if (error) {
    console.error("Insert entry error:", error);
    return null;
  }

  return data[0];
}

// 🔹 Eintrag löschen (für Undo später)
export async function deleteEntry(id) {
  const { error } = await supabase
    .from("entries")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete entry error:", error);
  }
}