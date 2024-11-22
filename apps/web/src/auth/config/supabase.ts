import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/env";

// if(!SUPABASE_URL || !SUPABASE_ANON_KEY) {
//     throw new Error("Missing Supabase Environment variables");
// }
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);