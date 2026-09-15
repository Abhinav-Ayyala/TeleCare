const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize(['patient']));

router.get('/dashboard', (req, res, next) => {
  try {
    const patient = db.prepare('SELECT id FROM patients WHERE user_id = ?').get(req.user.id);
    if (!patient) return res.status(404).json({ success: false, error: 'Patient not found' });
    const pid = patient.id;
    
    const upcomingCount = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE patient_id = ? AND status IN ('scheduled', 'in-progress') AND date >= date('now')").get(pid).count;
    const prescriptionsCount = db.prepare('SELECT COUNT(*) as count FROM prescriptions WHERE patient_id = ?').get(pid).count;
    const symptomsCount = db.prepare('SELECT COUNT(*) as count FROM symptom_checks WHERE patient_id = ?').get(pid).count;
    
    const recentAppointments = db.prepare(`
      SELECT a.*, u.first_name as doctor_first_name, u.last_name as doctor_last_name 
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u ON d.user_id = u.id
      WHERE a.patient_id = ?
      ORDER BY a.date DESC, a.time_slot DESC LIMIT 5
    `).all(pid);
    
    const userProfile = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    
    res.json({ success: true, data: { upcomingCount, prescriptionsCount, symptomsCount, recentAppointments, userProfile } });
  } catch (err) {
    next(err);
  }
});

router.get('/profile', (req, res, next) => {
  try {
    const profile = db.prepare(`
      SELECT u.first_name, u.last_name, u.email, u.phone, p.* 
      FROM users u 
      JOIN patients p ON u.id = p.user_id 
      WHERE u.id = ?
    `).get(req.user.id);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
});

router.put('/profile', (req, res, next) => {
  try {
    const { first_name, last_name, phone, date_of_birth, gender, blood_group, allergies, medical_history, emergency_contact } = req.body;
    db.transaction(() => {
      db.prepare('UPDATE users SET first_name=?, last_name=?, phone=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(first_name, last_name, phone, req.user.id);
      db.prepare('UPDATE patients SET date_of_birth=?, gender=?, blood_group=?, allergies=?, medical_history=?, emergency_contact=? WHERE user_id=?').run(
        date_of_birth, gender, blood_group, allergies, medical_history, emergency_contact, req.user.id
      );
    })();
    res.json({ success: true, data: 'Profile updated' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
