
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wcxxlvozdcuvfroxskcz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjeHhsdm96ZGN1dmZyb3hza2N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwMzU0NTksImV4cCI6MjA1NTYxMTQ1OX0.uH8KUqTI1wAPJ-eRV7BSC_5AeK0n0Oshkhq8GlVdMts';

export const supabase = createClient(supabaseUrl, supabaseKey);
