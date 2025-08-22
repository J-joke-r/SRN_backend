// routes/checkRole.js
const express = require("express");
const jwt = require("jsonwebtoken");
const { getSupabaseClient, getSupabaseAdmin } = require("../utils/supabaseClient");

const router = express.Router();
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Handle OPTIONS requests for CORS preflight
router.options("/", (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Middleware to verify JWT
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SUPABASE_JWT_SECRET);
    req.user = decoded; // contains `sub` (user_id) and `email`
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(403).json({ message: "Invalid token", error: err.message });
  }
};

// GET /check-role
router.get("/", verifyToken, async (req, res) => {
  try {
    // Use admin client to bypass RLS safely on the server
    const supabase = getSupabaseAdmin();
    const userId = req.user.sub;

    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching role:", error.message);
      return res.status(500).json({ message: "Database error", error: error.message });
    }

    if (!data) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ role: data.role });
  } catch (err) {
    console.error("Unexpected error in /check-role:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
