const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', (req, res, next) => {
  try {
    let appointments = [];
    if (req.user.role === 'patient') {
      const p = db.prepare('SELECT id FROM patients WHERE user_id = ?').get(req.user.id);
      if (!p) return res.json({ success: true, data: [] });
      appointments = db.prepare(`
        SELECT a.*, d.specialization, d.qualification, d.consultation_fee, 
               u.first_name as doctor_fn, u.last_name as doctor_ln, u.avatar as doctor_avatar 
        FROM appointments a 
        JOIN doctors d ON a.doctor_id = d.id 
        JOIN users u ON d.user_id = u.id 
        WHERE a.patient_id = ? 
        ORDER BY a.date DESC, a.time_slot DESC
      `).all(p.id);
    } else if (req.user.role === 'doctor') {
      const d = db.prepare('SELECT id FROM doctors WHERE user_id = ?').get(req.user.id);
      if (!d) return res.json({ success: true, data: [] });
      appointments = db.prepare(`
        SELECT a.*, p.date_of_birth, p.gender, p.blood_group, p.allergies, p.medical_history, 
               u.first_name as patient_fn, u.last_name as patient_ln, u.email as patient_email, u.phone as patient_phone 
        FROM appointments a 
        JOIN patients p ON a.patient_id = p.id 
        JOIN users u ON p.user_id = u.id 
        WHERE a.doctor_id = ? 
        ORDER BY a.date DESC, a.time_slot DESC
      `).all(d.id);
    } else {
      appointments = db.prepare(`
        SELECT a.*, 
               ud.first_name as doctor_fn, ud.last_name as doctor_ln, d.specialization,
               up.first_name as patient_fn, up.last_name as patient_ln
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        JOIN users ud ON d.user_id = ud.id
        JOIN patients p ON a.patient_id = p.id
        JOIN users up ON p.user_id = up.id
        ORDER BY a.date DESC, a.time_slot DESC
      `).all();
    }
    res.json({ success: true, data: appointments });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', (req, res, next) => {
  try {
    const appointment = db.prepare(`
      SELECT a.*, 
             d.specialization, d.qualification, d.consultation_fee,
             ud.first_name as doctor_fn, ud.last_name as doctor_ln, ud.email as doctor_email,
             up.first_name as patient_fn, up.last_name as patient_ln, up.email as patient_email, up.phone as patient_phone,
             p.date_of_birth, p.gender, p.blood_group, p.allergies, p.medical_history, p.emergency_contact
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users ud ON d.user_id = ud.id
      JOIN patients p ON a.patient_id = p.id
      JOIN users up ON p.user_id = up.id
      WHERE a.id = ?
    `).get(req.params.id);

    if (!appointment) return res.status(404).json({ success: false, error: 'Appointment not found' });

    // Also get existing prescription if any
    const prescription = db.prepare('SELECT * FROM prescriptions WHERE appointment_id = ?').get(req.params.id);
    if (prescription) {
      try { prescription.medications = JSON.parse(prescription.medications); } catch (e) { prescription.medications = []; }
      appointment.prescription = prescription;
    }

    res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
});

router.post('/', (req, res, next) => {
  try {
    if (req.user.role !== 'patient') return res.status(403).json({ success: false, error: 'Only patients can book appointments' });
    const p = db.prepare('SELECT id FROM patients WHERE user_id = ?').get(req.user.id);
    if (!p) return res.status(400).json({ success: false, error: 'Patient profile not found' });

    const { doctor_id, date, time_slot, type = 'video', reason, notes } = req.body;
    if (!doctor_id || !date || !time_slot) {
      return res.status(400).json({ success: false, error: 'Doctor, date, and time slot are required' });
    }
    
    const existing = db.prepare("SELECT id FROM appointments WHERE doctor_id = ? AND date = ? AND time_slot = ? AND status != 'cancelled'").get(doctor_id, date, time_slot);
    if (existing) return res.status(400).json({ success: false, error: 'This time slot is already booked. Please choose another slot.' });
    
    const id = uuidv4();
    db.prepare(`
      INSERT INTO appointments (id, patient_id, doctor_id, date, time_slot, type, reason, notes, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')
    `).run(id, p.id, doctor_id, date, time_slot, type, reason || 'General Consultation', notes || '');
    
    res.json({ success: true, data: { id } });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/status', (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['scheduled', 'in-progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true, data: { status, message: 'Status updated' } });
  } catch (err) {
    next(err);
  }
});

router.get('/slots/:doctorId/:date', (req, res, next) => {
  try {
    const { doctorId, date } = req.params;
    const doc = db.prepare('SELECT available_time_start, available_time_end FROM doctors WHERE id = ?').get(doctorId);
    if (!doc) return res.status(404).json({ success: false, error: 'Doctor not found' });
    
    const startHour = parseInt((doc.available_time_start || '09:00').split(':')[0], 10);
    const endHour = parseInt((doc.available_time_end || '17:00').split(':')[0], 10);
    const allSlots = [];
    for (let i = startHour; i < endHour; i++) {
      allSlots.push(`${i.toString().padStart(2, '0')}:00`);
      allSlots.push(`${i.toString().padStart(2, '0')}:30`);
    }
    
    const booked = db.prepare("SELECT time_slot FROM appointments WHERE doctor_id = ? AND date = ? AND status != 'cancelled'").all(doctorId, date).map(a => a.time_slot);
    const available = allSlots.filter(s => !booked.includes(s));
    
    res.json({ success: true, data: available });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
