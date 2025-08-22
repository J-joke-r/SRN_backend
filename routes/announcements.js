const express = require("express");
const router = express.Router();
const { getSupabaseClient } = require("../utils/supabaseClient");
const { verifyToken, requireAdmin } = require("../middleware/auth");

// Handle OPTIONS requests for CORS preflight
router.options("/", (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Handle OPTIONS requests for specific announcement routes
router.options("/:id", (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, DELETE, PUT, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

/**
 * GET: Fetch all announcements (public)
 */
router.get("/", async (req, res) => {
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch error:", error);
      return res.status(500).json({ error: "Failed to retrieve announcements", detail: error.message });
    }

    res.status(200).json(data || []);
  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST: Create new announcement (admin only)
 */
router.post("/", verifyToken, requireAdmin, async (req, res) => {
  const supabase = getSupabaseClient(req.token); // ✅ this must accept JWT from middleware
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  try {
    const { data, error } = await supabase
      .from("announcements")
      .insert([
        {
          title,
          content,
          author_email: req.user.email, // ✅ matches your RLS policy
          author_id: req.user.sub, // Add author_id to match the table schema and RLS policy
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error);
      return res.status(500).json({ error: "Failed to create announcement", detail: error.message });
    }

    res.status(201).json({ message: "Announcement created successfully", data });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * PUT: Update announcement (admin only)
 */
router.put("/:id", verifyToken, requireAdmin, async (req, res) => {
  const supabase = getSupabaseClient(req.token);
  const { id } = req.params;
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  try {
    // Check ownership
    const { data: existing, error: fetchError } = await supabase
      .from("announcements")
      .select("author_email")
      .eq("id", id)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    if (existing.author_email !== req.user.email) {
      return res.status(403).json({ error: "You can only update your own announcements" });
    }

    const { data, error } = await supabase
      .from("announcements")
      .update({
        title,
        content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update error:", error);
      return res.status(500).json({ error: "Failed to update announcement", detail: error.message });
    }

    res.status(200).json({ message: "Announcement updated successfully", data });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * DELETE: Delete announcement (admin only)
 */
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  const supabase = getSupabaseClient(req.token);
  const { id } = req.params;

  try {
    const { data: existing, error: fetchError } = await supabase
      .from("announcements")
      .select("author_email")
      .eq("id", id)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    if (existing.author_email !== req.user.email) {
      return res.status(403).json({ error: "You can only delete your own announcements" });
    }

    const { error } = await supabase.from("announcements").delete().eq("id", id);

    if (error) {
      console.error("Delete error:", error);
      return res.status(500).json({ error: "Failed to delete announcement", detail: error.message });
    }

    res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;




// const express = require("express");
// const router = express.Router();
// const { getSupabaseClient } = require("../utils/supabaseClient");
// const { verifyToken, requireAdmin } = require("../middleware/auth");

// /**
//  * GET: Fetch all announcements (public - no auth required)
//  */
// router.get("/", async (req, res) => {
//   const supabase = getSupabaseClient();
//   try {
//     const { data, error } = await supabase
//       .from("announcements")
//       .select("*")
//       .order("created_at", { ascending: false });

//     if (error) {
//       console.error("Fetch error:", error);
//       return res.status(500).json({
//         error: "Failed to retrieve announcements",
//         detail: error.message,
//       });
//     }

//     res.status(200).json(data || []);
//   } catch (err) {
//     console.error("Server error:", err.message);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// /**
//  * POST: Create new announcement (admin only)
//  */
// router.post("/", verifyToken, requireAdmin, async (req, res) => {
//   const supabase = getSupabaseClient(req.token);
//   const { title, content } = req.body;

//   if (!title || !content) {
//     return res.status(400).json({
//       error: "Title and content are required",
//     });
//   }

//   try {
//     const { data, error } = await supabase
//       .from("announcements")
//       .insert([
//         {
//           title,
//           content,
//           author_email: req.user.email,
//           author_id: req.user.sub,
//         },
//       ])
//       .select()
//       .single();

//     if (error) {
//       console.error("Insert error:", error);
//       return res.status(500).json({
//         error: "Failed to create announcement",
//         detail: error.message,
//       });
//     }

//     res.status(201).json({ message: "Announcement created successfully", data });
//   } catch (err) {
//     console.error("Server error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// /**
//  * PUT: Update announcement (admin only)
//  */
// router.put("/:id", verifyToken, requireAdmin, async (req, res) => {
//   const supabase = getSupabaseClient(req.token);
//   const { id } = req.params;
//   const { title, content } = req.body;

//   if (!title || !content) {
//     return res.status(400).json({
//       error: "Title and content are required",
//     });
//   }

//   try {
//     // First check if the announcement exists and belongs to the admin
//     const { data: existing, error: fetchError } = await supabase
//       .from("announcements")
//       .select("author_email")
//       .eq("id", id)
//       .single();

//     if (fetchError) {
//       return res.status(404).json({
//         error: "Announcement not found",
//       });
//     }

//     // Only allow admins to update announcements
//     if (existing.author_email !== req.user.email) {
//       return res.status(403).json({
//         error: "You can only update your own announcements",
//       });
//     }

//     const { data, error } = await supabase
//       .from("announcements")
//       .update({
//         title,
//         content,
//         updated_at: new Date().toISOString(),
//       })
//       .eq("id", id)
//       .select()
//       .single();

//     if (error) {
//       console.error("Update error:", error);
//       return res.status(500).json({
//         error: "Failed to update announcement",
//         detail: error.message,
//       });
//     }

//     res.status(200).json({ message: "Announcement updated successfully", data });
//   } catch (err) {
//     console.error("Server error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// /**
//  * DELETE: Delete announcement (admin only)
//  */
// router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
//   const supabase = getSupabaseClient(req.token);
//   const { id } = req.params;

//   try {
//     // First check if the announcement exists and belongs to the admin
//     const { data: existing, error: fetchError } = await supabase
//       .from("announcements")
//       .select("author_email")
//       .eq("id", id)
//       .single();

//     if (fetchError) {
//       return res.status(404).json({
//         error: "Announcement not found",
//       });
//     }

//     // Only allow admins to delete announcements
//     if (existing.author_email !== req.user.email) {
//       return res.status(403).json({
//         error: "You can only delete your own announcements",
//       });
//     }

//     const { error } = await supabase
//       .from("announcements")
//       .delete()
//       .eq("id", id);

//     if (error) {
//       console.error("Delete error:", error);
//       return res.status(500).json({
//         error: "Failed to delete announcement",
//         detail: error.message,
//       });
//     }

//     res.status(200).json({ message: "Announcement deleted successfully" });
//   } catch (err) {
//     console.error("Server error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// module.exports = router;
