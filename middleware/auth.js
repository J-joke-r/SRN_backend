// middleware/auth.js
const jwt = require("jsonwebtoken");
const { getSupabaseClient } = require("../utils/supabaseClient");

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Middleware to verify JWT from Supabase Auth
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SUPABASE_JWT_SECRET);

    // Store decoded data and token for later use
    req.user = decoded; // contains `sub` (UUID from auth.users.id) & `email`
    req.token = token;

    console.log("✅ Token verified. Decoded payload:", decoded);
    next();
  } catch (err) {
    console.error("❌ JWT verification failed:", err.message);
    return res.status(403).json({ message: "Invalid token", error: err.message });
  }
};

// Middleware to check if the authenticated user is admin
const requireAdmin = async (req, res, next) => {
  try {
    const supabase = getSupabaseClient(req.token);
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(400).json({ message: "Invalid token: missing user ID" });
    }

    const { data, error } = await supabase
      .from("users")
      .select("role")
      .eq("email", req.user.email)
      .maybeSingle();

    if (error) {
      console.error("Supabase role check error:", error.message);
      return res.status(500).json({ message: "Error checking role", error: error.message });
    }

    if (!data || data.role !== "admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    console.log("✅ Admin access granted for:", userId);
    next();
  } catch (err) {
    console.error("❌ Unexpected error in requireAdmin:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { verifyToken, requireAdmin };
