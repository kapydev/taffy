import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL; // add your Supabase URL here
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // add your Supabase KEY here

export const supabase = createClient(supabaseUrl, supabaseKey);