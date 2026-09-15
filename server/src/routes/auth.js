const express = require('express');
const router = express.Router();
const db = require('../db/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');

router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('first_name').notEmpty(),
  body('last_name').notEmpty(),
  body('role').isIn(['patient', 'doctor'])
], (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, error: errors.array() });
    
    const { email, password, first_name, last_name, role, phone } = req.body;
    
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(400).json({ success: false, error: 'Email already in use' });
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userId = uuidv4();
    
    db.transaction(() => {
      db.prepare('INSERT INTO users (id, email, password, role, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
        userId, email, hashedPassword, role, first_name, last_name, phone || null
      );
      
      if (role === 'patient') {
        const patientId = uuidv4();
        db.prepare('INSERT INTO patients (id, user_id) VALUES (?, ?)').run(patientId, userId);
      } else if (role === 'doctor') {
        const doctorId = uuidv4();
        const spec = req.body.specialization || 'General Physician';
        const qual = req.body.qualification || 'MBBS';
        const exp = req.body.experience_years || 0;
        db.prepare('INSERT INTO doctors (id, user_id, specialization, qualification, experience_years) VALUES (?, ?, ?, ?, ?)').run(
          doctorId, userId, spec, qual, exp
        );
      }
    })();
    
    const token = jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ success: true, data: { token, user: { id: userId, email, role, firstName: first_name, lastName: last_name } } });
  } catch (err) {
    next(err);
  }
});

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, error: errors.array() });
    
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    if (!user.is_active) {
      return res.status(403).json({ success: false, error: 'Account disabled' });
    }
    
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ success: true, data: { token, user: { id: user.id, email: user.email, role: user.role, firstName: user.first_name, lastName: user.last_name } } });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, (req, res, next) => {
  try {
    const user = db.prepare('SELECT id, email, role, first_name, last_name, phone, avatar, is_active FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    
    let details = null;
    if (user.role === 'patient') {
      details = db.prepare('SELECT * FROM patients WHERE user_id = ?').get(user.id);
    } else if (user.role === 'doctor') {
      details = db.prepare('SELECT * FROM doctors WHERE user_id = ?').get(user.id);
    }
    
    res.json({ success: true, data: { ...user, details } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
