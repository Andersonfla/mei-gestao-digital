
import { createClient } from '@supabase/supabase-js';

// Define hardcoded fallback values for the Supabase URL and anon key
// These will be used if the environment variables are not available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ucnajqoapngtearuafkv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjbmFqcW9hcG5ndGVhcnVhZmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNDE5NDMsImV4cCI6MjA2MjkxNzk0M30.RItktoPxnmNDb7icRk_G7HthZtZ6XgbgNS9SIuEAfuc';

// Create a Supabase client instance with auth persistence configured
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
});
