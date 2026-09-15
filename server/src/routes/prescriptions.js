const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// List prescriptions for current user
router.get('/', (req, res, next) => {
  try {
    let prescriptions = [];
    if (req.user.role === 'patient') {
      const p = db.prepare('SELECT id FROM patients WHERE user_id = ?').get(req.user.id);
      if (!p) return res.json({ success: true, data: [] });
      prescriptions = db.prepare(`
        SELECT pr.*, 
               ud.first_name as doctor_fn, ud.last_name as doctor_ln, d.specialization, d.qualification,
               a.date as appointment_date, a.time_slot as appointment_time
        FROM prescriptions pr
        JOIN doctors d ON pr.doctor_id = d.id
        JOIN users ud ON d.user_id = ud.id
        LEFT JOIN appointments a ON pr.appointment_id = a.id
        WHERE pr.patient_id = ?
        ORDER BY pr.created_at DESC
      `).all(p.id);
    } else if (req.user.role === 'doctor') {
      const d = db.prepare('SELECT id FROM doctors WHERE user_id = ?').get(req.user.id);
      if (!d) return res.json({ success: true, data: [] });
      prescriptions = db.prepare(`
        SELECT pr.*, 
               up.first_name as patient_fn, up.last_name as patient_ln, up.email as patient_email,
               p.date_of_birth, p.gender,
               a.date as appointment_date
        FROM prescriptions pr
        JOIN patients p ON pr.patient_id = p.id
        JOIN users up ON p.user_id = up.id
        LEFT JOIN appointments a ON pr.appointment_id = a.id
        WHERE pr.doctor_id = ?
        ORDER BY pr.created_at DESC
      `).all(d.id);
    } else {
      prescriptions = db.prepare(`
        SELECT pr.*, 
               ud.first_name as doctor_fn, ud.last_name as doctor_ln,
               up.first_name as patient_fn, up.last_name as patient_ln
        FROM prescriptions pr
        JOIN doctors d ON pr.doctor_id = d.id
        JOIN users ud ON d.user_id = ud.id
        JOIN patients p ON pr.patient_id = p.id
        JOIN users up ON p.user_id = up.id
        ORDER BY pr.created_at DESC
      `).all();
    }

    prescriptions.forEach(p => {
      try { p.medications = JSON.parse(p.medications); } catch (e) { p.medications = []; }
    });

    res.json({ success: true, data: prescriptions });
  } catch (err) {
    next(err);
  }
});

// Get single prescription
router.get('/:id', (req, res, next) => {
  try {
    const prescription = db.prepare(`
      SELECT pr.*, 
             ud.first_name as doctor_fn, ud.last_name as doctor_ln, ud.email as doctor_email,
             d.specialization, d.qualification,
             up.first_name as patient_fn, up.last_name as patient_ln, up.email as patient_email, up.phone as patient_phone,
             p.date_of_birth, p.gender, p.blood_group, p.allergies,
             a.date as appointment_date, a.time_slot, a.reason as appointment_reason
      FROM prescriptions pr
      JOIN doctors d ON pr.doctor_id = d.id
      JOIN users ud ON d.user_id = ud.id
      JOIN patients p ON pr.patient_id = p.id
      JOIN users up ON p.user_id = up.id
      LEFT JOIN appointments a ON pr.appointment_id = a.id
      WHERE pr.id = ?
    `).get(req.params.id);

    if (!prescription) return res.status(404).json({ success: false, error: 'Prescription not found' });

    try { prescription.medications = JSON.parse(prescription.medications); } catch (e) { prescription.medications = []; }

    res.json({ success: true, data: prescription });
  } catch (err) {
    next(err);
  }
});

// Create prescription (Doctor only)
router.post('/', (req, res, next) => {
  try {
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only doctors can write prescriptions' });
    }

    const { appointment_id, patient_id, diagnosis, medications = [], instructions = '', follow_up_date = '' } = req.body;

    let doctorId = null;
    if (req.user.role === 'doctor') {
      const doc = db.prepare('SELECT id FROM doctors WHERE user_id = ?').get(req.user.id);
      if (!doc) return res.status(404).json({ success: false, error: 'Doctor profile not found' });
      doctorId = doc.id;
    }

    let finalPatientId = patient_id;
    if (appointment_id && !finalPatientId) {
      const appt = db.prepare('SELECT patient_id, doctor_id FROM appointments WHERE id = ?').get(appointment_id);
      if (appt) {
        finalPatientId = appt.patient_id;
        if (!doctorId) doctorId = appt.doctor_id;
      }
    }

    if (!finalPatientId || !diagnosis) {
      return res.status(400).json({ success: false, error: 'Patient ID and Diagnosis are required' });
    }

    const id = uuidv4();
    const medsJson = typeof medications === 'string' ? medications : JSON.stringify(medications);

    db.transaction(() => {
      db.prepare(`
        INSERT INTO prescriptions (id, appointment_id, doctor_id, patient_id, diagnosis, medications, instructions, follow_up_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, appointment_id || null, doctorId, finalPatientId, diagnosis, medsJson, instructions, follow_up_date);

      if (appointment_id) {
        db.prepare("UPDATE appointments SET status = 'completed' WHERE id = ?").run(appointment_id);
      }

      if (doctorId) {
        db.prepare("UPDATE doctors SET total_consultations = total_consultations + 1 WHERE id = ?").run(doctorId);
      }
    })();

    res.json({ success: true, data: { id, message: 'Prescription created successfully' } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
