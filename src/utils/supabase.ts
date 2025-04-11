import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase Project URL and Anon Key
const supabaseUrl = 'https://wgckmallvioqfdcbccfh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnY2ttYWxsdmlvcWZkY2JjY2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTMwMjQsImV4cCI6MjA1OTk2OTAyNH0.K-hp1ejQy-uOZ_-773Y1GDD4DZSx0dUgB6kC_maVpFU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
