import { supabase } from "/services/supabaseClient.js";

export async function searchFood(query) {
  if (!query) return [];

  const { data, error } = await supabase
    .from("foods")
    .select("*")
    .ilike("name", `%${query}%`)
    .limit(20);

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}