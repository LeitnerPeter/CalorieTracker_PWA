const supabaseUrl = "https://xyakkemkejxnpdzopmbb.supabase.co";
const supabaseKey = "sb_publishable_ZzFGVRc3XUU7QnFR364VQg_UwAmO1Zm";

export const supabaseClient = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);