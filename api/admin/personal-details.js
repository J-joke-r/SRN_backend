// routes/api/admin/personal-details.js

const express = require("express");
const router = express.Router();
const { getSupabaseAdmin } = require("../../utils/supabaseClient");
const { verifyToken, requireAdmin } = require("../../middleware/auth");

// Handle OPTIONS requests for CORS preflight
router.options("/", (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// GET /api/admin/personal-details
// Only accessible to admin users
router.get("/", verifyToken, requireAdmin, async (req, res) => {
  try {

    const { data, error } = await getSupabaseAdmin()
      .from("personal_details")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching personal details:", error);
      return res.status(500).json({ error: "Failed to fetch personal details" });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
