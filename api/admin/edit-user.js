const express = require('express');
const router = express.Router();
const { getSupabaseClient } = require('../../utils/supabaseClient');
const { verifyToken, requireAdmin } = require('../../middleware/auth');

// Handle OPTIONS requests for CORS preflight
router.options('/edit-user', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

/**
 * Admin updates a user's personal details including adhaar and gender
 * Table: personal_details
 */
router.post('/edit-user', verifyToken, requireAdmin, async (req, res) => {
  const { id, ...updatedFields } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const supabase = getSupabaseClient(req.token);
  const { data, error } = await supabase
    .from('personal_details')
    .update(updatedFields)
    .eq('id', id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: 'User updated successfully', data });
});

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const { createClient } = require('@supabase/supabase-js');

// // Setup Supabase Admin client
// const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// // POST /api/admin/edit-user
// router.post('/edit-user', async (req, res) => {
//   const { id, ...updatedFields } = req.body;

//   if (!id) {
//     return res.status(400).json({ error: 'User ID is required' });
//   }

//   const { data, error } = await supabase
//     .from('PersonalDetails')
//     .update(updatedFields)
//     .eq('id', id)
//     .select();

//   if (error) {
//     return res.status(500).json({ error: error.message });
//   }

//   res.json({ message: 'User updated successfully', data });
// });

// module.exports = router;
