
import { supabase } from "/js/supabase.js";

export async function getTodayEntries() {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("date", today);

  if (error) {
    console.error("Entries error:", error);
    return [];
  }

  return data;
}