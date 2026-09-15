const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize(['admin']));

router.get('/stats', (req, res, next) => {
  try {
    const total_users = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const total_patients = db.prepare('SELECT COUNT(*) as count FROM patients').get().count;
    const total_doctors = db.prepare('SELECT COUNT(*) as count FROM doctors').get().count;
    const total_appointments = db.prepare('SELECT COUNT(*) as count FROM appointments').get().count;
    const total_consultations = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'completed'").get().count;
    
    res.json({ success: true, data: { total_users, total_patients, total_doctors, total_appointments, total_consultations } });
  } catch (err) {
    next(err);
  }
});

router.get('/users', (req, res, next) => {
  try {
    const users = db.prepare('SELECT id, email, role, first_name, last_name, phone, is_active, created_at FROM users ORDER BY created_at DESC').all();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

router.put('/users/:id/status', (req, res, next) => {
  try {
    const user = db.prepare('SELECT is_active FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    const newStatus = user.is_active ? 0 : 1;
    db.prepare('UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newStatus, req.params.id);
    res.json({ success: true, data: { is_active: newStatus } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
