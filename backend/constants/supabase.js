// constants/supabase.js
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();


// Admin client (for privileged routes like deleteUser)
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);



const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// // Helper function to create authenticated client
// function createAuthenticatedClient(token) {
//     return createClient(supabaseUrl, supabaseKey, {
//         global: {
//             headers: {
//                 Authorization: `Bearer ${token}`
//             }
//         }
//     });
// }

module.exports = {
    supabase,
    supabaseAdmin
    //createAuthenticatedClient
};