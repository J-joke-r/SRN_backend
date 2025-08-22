const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { getSupabaseClient } = require('../utils/supabaseClient');

// Handle OPTIONS requests for CORS preflight
router.options('/users/:id/role', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

const personalDetailsRouter = require('../api/admin/personal-details');
// ✅ Fetch all users' personal details
router.use('/personal-details', personalDetailsRouter);

// ✅ Update user role (admin only)
router.put('/users/:id/role', verifyToken, requireAdmin, async (req, res) => {
  const supabase = getSupabaseClient(req.token);
  const { role } = req.body;
  const { id } = req.params;

  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  const { data, error } = await supabase
    .from('users')
    .update({ role })
    .eq('user_id', id);

  if (error) {
    return res.status(500).json({ message: 'Error updating role', error: error.message });
  }

  res.json({ message: 'Role updated successfully', data });
});

module.exports = router;
