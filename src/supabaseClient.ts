import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ojpalzedczyafmtknrgj.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qcGFsemVkY3p5YWZtdGtucmdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTAyOTksImV4cCI6MjA4MDMyNjI5OX0.cU8zYgDtkLkOe3DrF8HOem-2_aiPVPXD3V20-r43Pao";

export const supabase = createClient(supabaseUrl, supabaseKey);
