import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://wbbdkahgndqjmnpbimht.supabase.co";
const SUPABASE_KEY = "sb_publishable_B6jILEC3x1AC5x94zVe3DQ_y6XsX72o";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);