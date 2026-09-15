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
      appointments = db.prepare(`
        SELECT a.*, d.specialization, u.first_name as doctor_fn, u.last_name as doctor_ln 
        FROM appointments a JOIN doctors d ON a.doctor_id = d.id JOIN users u ON d.user_id = u.id 
        WHERE a.patient_id = ? ORDER BY a.date DESC, a.time_slot DESC
      `).all(p.id);
    } else if (req.user.role === 'doctor') {
      const d = db.prepare('SELECT id FROM doctors WHERE user_id = ?').get(req.user.id);
      appointments = db.prepare(`
        SELECT a.*, p.date_of_birth, u.first_name as patient_fn, u.last_name as patient_ln 
        FROM appointments a JOIN patients p ON a.patient_id = p.id JOIN users u ON p.user_id = u.id 
        WHERE a.doctor_id = ? ORDER BY a.date DESC, a.time_slot DESC
      `).all(d.id);
    } else {
      appointments = db.prepare('SELECT * FROM appointments ORDER BY date DESC').all();
    }
    res.json({ success: true, data: appointments });
  } catch (err) {
    next(err);
  }
});

router.post('/', (req, res, next) => {
  try {
    if (req.user.role !== 'patient') return res.status(403).json({ success: false, error: 'Only patients can book' });
    const p = db.prepare('SELECT id FROM patients WHERE user_id = ?').get(req.user.id);
    const { doctor_id, date, time_slot, type = 'video', reason, notes } = req.body;
    
    const existing = db.prepare('SELECT id FROM appointments WHERE doctor_id = ? AND date = ? AND time_slot = ? AND status != "cancelled"').get(doctor_id, date, time_slot);
    if (existing) return res.status(400).json({ success: false, error: 'Slot already booked' });
    
    const id = uuidv4();
    db.prepare(`
      INSERT INTO appointments (id, patient_id, doctor_id, date, time_slot, type, reason, notes) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, p.id, doctor_id, date, time_slot, type, reason, notes);
    
    res.json({ success: true, data: { id } });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/status', (req, res, next) => {
  try {
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') return res.status(403).json({ success: false, error: 'Forbidden' });
    const { status } = req.body;
    db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true, data: 'Status updated' });
  } catch (err) {
    next(err);
  }
});

router.get('/slots/:doctorId/:date', (req, res, next) => {
  try {
    const { doctorId, date } = req.params;
    const doc = db.prepare('SELECT available_time_start, available_time_end FROM doctors WHERE id = ?').get(doctorId);
    if (!doc) return res.status(404).json({ success: false, error: 'Doctor not found' });
    
    const start = parseInt(doc.available_time_start.split(':')[0]);
    const end = parseInt(doc.available_time_end.split(':')[0]);
    const allSlots = [];
    for (let i = start; i < end; i++) {
      allSlots.push(`${i.toString().padStart(2, '0')}:00`);
      allSlots.push(`${i.toString().padStart(2, '0')}:30`);
    }
    
    const booked = db.prepare('SELECT time_slot FROM appointments WHERE doctor_id = ? AND date = ? AND status != "cancelled"').all(doctorId, date).map(a => a.time_slot);
    const available = allSlots.filter(s => !booked.includes(s));
    
    res.json({ success: true, data: available });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
