import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dqazpqzwezfeyewkoceh.supabase.co";
const supabaseAnonKey = "sb_publishable_lYrXce2bx2QgCk4K6UGxLA_ZZyg5ovf";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);