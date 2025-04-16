import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get Supabase credentials from environment variables or app config
const supabaseUrl = process.env.SUPA_PROJECT_URL || Constants.expoConfig?.extra?.SUPA_PROJECT_URL || '';
const supabaseAnonKey = process.env.SUPA_ANON_KEY || Constants.expoConfig?.extra?.SUPA_ANON_KEY || '';

// Validate that keys are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please check your environment variables or app.json configuration.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
