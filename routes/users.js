const express = require("express");
const router = express.Router();
const { getSupabaseClient } = require("../utils/supabaseClient");
const { verifyToken } = require("../middleware/auth");

// Handle OPTIONS requests for CORS preflight
router.options("/register", (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
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

// POST /api/users/register
router.post("/register", verifyToken, async (req, res) => {
  const supabase = getSupabaseClient(req.token);
  const { role = "member" } = req.body;
  const uid = req.user.sub;
  const email = req.user.email;

  try {
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", uid)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError;
    }

    if (existingUser) {
      return res.status(200).json({ message: "User already registered", data: existingUser });
    }

    // Insert new user
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        user_id: uid, // ✅ Corrected from firebase_uid to user_id
        email: email,
        role: role,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json({ message: "User registered", data: newUser });
  } catch (err) {
    console.error("User registration error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/users/me
router.get("/me", verifyToken, async (req, res) => {
  const supabase = getSupabaseClient(req.token);
  const uid = req.user.sub;

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("email, role")
      .eq("user_id", uid)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ message: "User not found" });
      }
      throw error;
    }

    res.status(200).json({ role: user.role, email: user.email });
  } catch (err) {
    console.error("Get user error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;




// const express = require("express");
// const router = express.Router();
// const { supabase } = require("../utils/supabaseClient");
// const { verifyToken } = require("../middleware/auth");

// // POST /api/users/register
// router.post("/register", verifyToken, async (req, res) => {
//   const { role = "member" } = req.body;
//   const { uid, email } = req.user;

//   try {
//     // Check if user already exists
//     const { data: existingUser, error: checkError } = await supabase
//       .from("users")
//       .select("*")
//       .eq("firebase_uid", uid)
//       .single();

//     if (checkError && checkError.code !== "PGRST116") {
//       throw checkError;
//     }

//     if (existingUser) {
//       return res.status(200).json({ message: "User already registered", data: existingUser });
//     }

//     // Insert user
//     const { data: newUser, error: insertError } = await supabase
//       .from("users")
//       .insert({
//         firebase_uid: uid,
//         email: email,
//         role: role
//       })
//       .select()
//       .single();

//     if (insertError) throw insertError;

//     res.status(201).json({ message: "User registered", data: newUser });
//   } catch (err) {
//     console.error("User registration error:", err.message);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// router.get("/me", verifyToken, async (req, res) => {
//   const uid = req.user.uid;

//   try {
//     const { data: user, error } = await supabase
//       .from("users")
//       .select("email, role")
//       .eq("firebase_uid", uid)
//       .single();

//     if (error) {
//       if (error.code === "PGRST116") {
//         return res.status(404).json({ message: "User not found" });
//       }
//       throw error;
//     }

//     res.status(200).json({ role: user.role, email: user.email });
//   } catch (err) {
//     console.error("Get user error:", err.message);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// module.exports = router;
