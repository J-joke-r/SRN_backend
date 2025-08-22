const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Create client with user JWT (default behavior for frontend/user routes)
const getSupabaseClient = (token) => {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      global: {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {}, // no token = no header
      },
    }
  );
};

// Create admin client (uses service role key, bypasses RLS)
// ⚠️ Never expose service key to frontend
const getSupabaseAdmin = () => {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
};

module.exports = { getSupabaseClient, getSupabaseAdmin };








// const { createClient } = require("@supabase/supabase-js");
// require("dotenv").config();

// let supabase = null;



// // Function to create a Supabase client with user token
// const getSupabaseClient = (token) => {
//   return createClient(
//     process.env.SUPABASE_URL,
//     process.env.SUPABASE_ANON_KEY,
//     {
//       global: {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       },
//     }
//   );
// };

// module.exports = { getSupabaseClient };
