const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticate, authorize } = require('../middleware/auth');

// Public: List doctors with filtering
router.get('/', (req, res, next) => {
  try {
    const { specialization, search, page = 1, limit = 50 } = req.query;
    let query = `
      SELECT d.*, u.first_name, u.last_name, u.email, u.phone, u.avatar 
      FROM doctors d 
      JOIN users u ON d.user_id = u.id 
      WHERE u.is_active = 1
    `;
    const params = [];
    
    if (specialization && specialization !== 'All' && specialization !== 'All Specialties') {
      query += ` AND d.specialization = ?`;
      params.push(specialization);
    }
    
    if (search) {
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR d.specialization LIKE ? OR d.qualification LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    query += ` ORDER BY d.experience_years DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    
    const doctors = db.prepare(query).all(...params);
    res.json({ success: true, data: doctors });
  } catch (err) {
    next(err);
  }
});

// Authenticated: Doctor Dashboard Data
router.get('/dashboard', authenticate, authorize(['doctor']), (req, res, next) => {
  try {
    const doctor = db.prepare('SELECT id, specialization, qualification, consultation_fee, rating, total_consultations FROM doctors WHERE user_id = ?').get(req.user.id);
    if (!doctor) return res.status(404).json({ success: false, error: 'Doctor profile not found' });

    const docId = doctor.id;
    const today = new Date().toISOString().split('T')[0];

    // Today's appointments count
    const todayCount = db.prepare(`
      SELECT COUNT(*) as count FROM appointments 
      WHERE doctor_id = ? AND date = ? AND status != 'cancelled'
    `).get(docId, today).count;

    // Total unique patients
    const totalPatients = db.prepare(`
      SELECT COUNT(DISTINCT patient_id) as count FROM appointments 
      WHERE doctor_id = ?
    `).get(docId).count;

    // Total completed consultations
    const completedCount = db.prepare(`
      SELECT COUNT(*) as count FROM appointments 
      WHERE doctor_id = ? AND status = 'completed'
    `).get(docId).count;

    // Today's schedule
    const todaySchedule = db.prepare(`
      SELECT a.*, 
             u.first_name as patient_fn, u.last_name as patient_ln, u.email as patient_email, u.phone as patient_phone,
             p.date_of_birth, p.gender, p.blood_group, p.allergies, p.medical_history
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE a.doctor_id = ? AND a.date = ? AND a.status != 'cancelled'
      ORDER BY a.time_slot ASC
    `).all(docId, today);

    // Recent patients / appointments
    const recentAppointments = db.prepare(`
      SELECT a.*, 
             u.first_name as patient_fn, u.last_name as patient_ln,
             p.date_of_birth, p.gender
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE a.doctor_id = ?
      ORDER BY a.date DESC, a.time_slot DESC
      LIMIT 10
    `).all(docId);

    res.json({
      success: true,
      data: {
        doctor,
        stats: {
          todayAppointments: todayCount,
          totalPatients: totalPatients,
          completedConsultations: completedCount || doctor.total_consultations || 0,
          rating: doctor.rating || 4.9
        },
        todaySchedule,
        recentAppointments
      }
    });
  } catch (err) {
    next(err);
  }
});

// Single doctor details
router.get('/:id', (req, res, next) => {
  try {
    const doctor = db.prepare(`
      SELECT d.*, u.first_name, u.last_name, u.email, u.phone, u.avatar 
      FROM doctors d 
      JOIN users u ON d.user_id = u.id 
      WHERE d.id = ?
    `).get(req.params.id);
    
    if (!doctor) return res.status(404).json({ success: false, error: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
