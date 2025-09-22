// constants/supabase.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rbkupzbrtrwaajuqpybc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJia3VwemJydHJ3YWFqdXFweWJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3OTQ4NTEsImV4cCI6MjA3MzM3MDg1MX0.xbeUAXN0Wnb4PsaxmjD0TCx_DDn1p1m-Rb2pTJQtL_M';

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to create authenticated client
function createAuthenticatedClient(token) {
    return createClient(supabaseUrl, supabaseKey, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    });
}

module.exports = {
    supabase,
    createAuthenticatedClient
};