// js/supabase.js

const SUPABASE_URL = "https://ljscewpwqwkznlcavpnw.supabase.co";
const SUPABASE_KEY = "sb_publishable_WWMY-LXeh2iMKXJgKW8hSg_MyxqPGBQ";

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
