const supabaseUrl = "https://xyakkemkejxnpdzopmbb.supabase.co";
const supabaseKey = "sb_publishable_ZzFGVRc3XUU7QnFR364VQg_UwAmO1Zm";

// Supabase kommt weiterhin vom CDN (index.html)
export const supabase = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);