// Use import { supabase } from '@/lib/supabase';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://rbkupzbrtrwaajuqpybc.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJia3VwemJydHJ3YWFqdXFweWJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3OTQ4NTEsImV4cCI6MjA3MzM3MDg1MX0.xbeUAXN0Wnb4PsaxmjD0TCx_DDn1p1m-Rb2pTJQtL_M"



export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});