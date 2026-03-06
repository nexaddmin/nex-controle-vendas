const SUPABASE_URL = "https://ljscewpwqwkznlcavpnw.supabase.co";
const SUPABASE_KEY = "sb_publishable_WWMY-LXeh2iMKXJgKW8hSg_MyxqPGBQ";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

window.supabaseClient = supabase;
