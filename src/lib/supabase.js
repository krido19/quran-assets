import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://iobjxfmhziptjwlctxjo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvYmp4Zm1oemlwdGp3bGN0eGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzODYzNDEsImV4cCI6MjA3OTk2MjM0MX0.W8hgaOI-QXnxt1l6yNLfgTgpNzveeCNJVaDEkK-4QTQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
