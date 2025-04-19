import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { SUPA_PROJECT_URL, SUPA_ANON_KEY } from '@env';

// Get Supabase credentials from environment variables or app config
const supabaseUrl = SUPA_PROJECT_URL;
const supabaseAnonKey = SUPA_ANON_KEY;
// Validate that keys are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please check your environment variables or app.json configuration.');
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
