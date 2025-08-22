const express = require("express");
const router = express.Router();
const { getSupabaseClient } = require("../utils/supabaseClient");
const { verifyToken, requireAdmin } = require("../middleware/auth");

// Handle OPTIONS requests for CORS preflight
router.options("/", (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Handle OPTIONS requests for /me endpoint
router.options("/me", (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Handle OPTIONS requests for /all endpoint
router.options("/all", (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

/**
 * POST/PUT: Create or update user's personal details
 * Email comes from authenticated user
 */
router.post("/", verifyToken, async (req, res) => {
  const supabase = getSupabaseClient(req.token);

  const {
    name,
    father_name,
    nationality,
    phone_number,
    date_of_birth,
    caste,
    gender,
    gotra,
    education,
    occupation,
    postal_address,
    mother_tongue,
    marital_status,
    state,
    district,
    adhaar,
  } = req.body;

  // Convert dd/mm/yyyy (if provided) to ISO yyyy-mm-dd for storage
  let dobForStore = date_of_birth;
  if (typeof date_of_birth === 'string' && /^(\d{2})\/(\d{2})\/(\d{4})$/.test(date_of_birth)) {
    try {
      const [, dd, mm, yyyy] = date_of_birth.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      dobForStore = `${yyyy}-${mm}-${dd}`;
    } catch {}
  }

  try {
    const { data, error } = await supabase
      .from("personal_details")
      .upsert(
        [
          {
            user_id: req.user.sub,
            email: req.user.email, // store email in table
            name,
            father_name,
            nationality,
            phone_number,
            date_of_birth: dobForStore,
            caste,
            gender,
            gotra,
            education,
            occupation,
            postal_address,
            mother_tongue,
            marital_status,
            state,
            district,
            adhaar
          },
        ],
        { onConflict: "user_id" }
      )
      .select();

    if (error) {
      console.error("Upsert error:", error);
      return res.status(500).json({
        error: "Failed to save data",
        detail: error.message,
      });
    }

    res.status(201).json({ message: "Saved successfully", data });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET: Fetch logged-in user's details
 */
router.get("/me", verifyToken, async (req, res) => {
  const supabase = getSupabaseClient(req.token);
  try {
    const { data, error } = await supabase
      .from("personal_details")
      .select("*")
      .eq("user_id", req.user.sub)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Fetch error:", error);
      return res.status(500).json({
        error: "Failed to retrieve data",
        detail: error.message,
      });
    }

    // Format date_of_birth to dd/mm/yyyy for client
    if (data && data.date_of_birth) {
      try {
        const base = String(data.date_of_birth).split('T')[0];
        const [y, m, d] = base.split('-');
        if (y && m && d) {
          data.date_of_birth = `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
        }
      } catch {}
    }

    res.status(200).json(data || {});
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET: Admin fetches all users' personal details
 */
router.get("/all", verifyToken, requireAdmin, async (req, res) => {
  const supabase = getSupabaseClient(req.token);
  try {
    const { data, error } = await supabase
      .from("personal_details")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch error:", error);
      return res.status(500).json({
        error: "Failed to retrieve data",
        detail: error.message,
      });
    }

    // Convert date_of_birth for all rows to dd/mm/yyyy
    const mapped = (data || []).map((row) => {
      if (row && row.date_of_birth) {
        try {
          const base = String(row.date_of_birth).split('T')[0];
          const [y, m, d] = base.split('-');
          if (y && m && d) {
            row.date_of_birth = `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
          }
        } catch {}
      }
      return row;
    });
    res.status(200).json({ data: mapped });
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;



// const express = require("express");
// const router = express.Router();
// const { getSupabaseClient } = require("../utils/supabaseClient");
// const { verifyToken, requireAdmin } = require("../middleware/auth");

// /**
//  * POST/PUT: Create or update user's personal details
//  */
// router.post("/", verifyToken, async (req, res) => {
//   const supabase = getSupabaseClient(req.token);
//   const {
//     name,
//     father_name,
//     nationality,
//     phone_number,
//     date_of_birth,
//     caste,
//     subcaste,
//     gotra,
//     education,
//     occupation,
//     postal_address,
//     mother_tongue,
//     marital_status,
//     state,
//     district,
//   } = req.body;

//   try {
//     const { data, error } = await supabase
//       .from("personal_details")
//       .upsert(
//         [
//           {
//             user_id: req.user.sub,
//             name,
//             father_name,
//             nationality,
//             phone_number,
//             date_of_birth,
//             caste,
//             subcaste,
//             gotra,
//             education,
//             occupation,
//             postal_address,
//             mother_tongue,
//             marital_status,
//             state,
//             district,
//           },
//         ],
//         { onConflict: "user_id" } // Update if record exists
//       )
//       .select();

//     if (error) {
//       console.error("Upsert error:", error);
//       return res
//         .status(500)
//         .json({ error: "Failed to save data", detail: error.message });
//     }

//     res.status(201).json({ message: "Saved successfully", data });
//   } catch (err) {
//     console.error("Server error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// /**
//  * GET: Fetch logged-in user's details
//  */
// router.get("/me", verifyToken, async (req, res) => {
//   const supabase = getSupabaseClient(req.token);
//   try {
//     const { data, error } = await supabase
//       .from("personal_details")
//       .select("*")
//       .eq("user_id", req.user.sub)
//       .single();

//     if (error && error.code !== "PGRST116") { // Ignore "no rows found" error
//       console.error("Fetch error:", error);
//       return res
//         .status(500)
//         .json({ error: "Failed to retrieve data", detail: error.message });
//     }

//     res.status(200).json(data || {});
//   } catch (err) {
//     console.error("Server error:", err.message);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// /**
//  * GET: Admin fetches all users' personal details
//  */
// router.get("/all", verifyToken, requireAdmin, async (req, res) => {
//   const supabase = getSupabaseClient(req.token);
//   try {
//     const { data, error } = await supabase
//       .from("personal_details")
//       .select("*")
//       .order("created_at", { ascending: false });

//     if (error) {
//       console.error("Fetch error:", error);
//       return res
//         .status(500)
//         .json({ error: "Failed to retrieve data", detail: error.message });
//     }

//     res.status(200).json({ data });
//   } catch (err) {
//     console.error("Server error:", err.message);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// module.exports = router;


