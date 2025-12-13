import { createClient } from '@supabase/supabase-js';

const SUPABASE_UPDATE_URL = 'https://ratrlqwxzmyhlwnxukkf.supabase.co';
const SUPABASE_UPDATE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhdHJscXd4em15aGx3bnh1a2tmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NzUwMDksImV4cCI6MjA4MDM1MTAwOX0.ocj4o9FQU-GyW3gOYHHZPPRCJiu6oCeCZg4zdFYOZj8';

export const supabaseUpdate = createClient(SUPABASE_UPDATE_URL, SUPABASE_UPDATE_KEY);
