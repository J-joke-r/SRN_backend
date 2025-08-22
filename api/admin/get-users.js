// routes/admin/get-users.js
const express = require('express');
const router = express.Router();
const { getSupabaseClient } = require('../../utils/supabaseClient');
const jwt = require('jsonwebtoken');

// Handle OPTIONS requests for CORS preflight
router.options('/users', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Middleware to verify admin role
const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(403).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.decode(token); // Supabase JWT contains email

    if (!decoded?.email) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    const { data, error } = await getSupabaseClient()
      .from('users')
      .select('role')
      .eq('email', decoded.email)
      .single();

    if (error || data?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    req.adminEmail = decoded.email;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Auth error', details: err.message });
  }
};

// GET all users with optional filters & pagination
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const {
      search,
      district,
      nationality,
      state,
      caste,
      gender,
      gotra,
      marital_status,
      adhaar,
      page = 1,
      limit = 10
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = getSupabaseClient()
      .from('personal_details')
      .select(
        'id, user_id, email, adhaar, name, phone_number, district, nationality, state, caste, gender, gotra, marital_status, created_at',
        { count: 'exact' }
      );

    if (search) query = query.ilike('name', `%${search}%`);
    if (district) query = query.eq('district', district);
    if (nationality) query = query.eq('nationality', nationality);
    if (state) query = query.eq('state', state);
    if (caste) query = query.eq('caste', caste);
    if (gender) query = query.eq('gender', gender);
    if (gotra) query = query.eq('gotra', gotra);
    if (marital_status) query = query.eq('marital_status', marital_status);
    if (adhaar) query = query.eq('adhaar', adhaar);

    query = query.order('name', { ascending: true })
                 .range(offset, offset + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) return res.status(500).json({ error: error.message });

    res.json({ data, total: count || 0 });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;
