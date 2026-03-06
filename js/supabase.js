// js/supabase.js

const SUPABASE_URL = "SUA_PROJECT_URL";
const SUPABASE_KEY = "SUA_PUBLISHABLE_KEY";

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
