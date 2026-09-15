const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/', (req, res, next) => {
  try {
    const { specialization, search, page = 1, limit = 10 } = req.query;
    let query = `
      SELECT d.*, u.first_name, u.last_name, u.email, u.phone, u.avatar 
      FROM doctors d 
      JOIN users u ON d.user_id = u.id 
      WHERE u.is_active = 1
    `;
    const params = [];
    
    if (specialization) {
      query += ` AND d.specialization = ?`;
      params.push(specialization);
    }
    
    if (search) {
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    
    const doctors = db.prepare(query).all(...params);
    res.json({ success: true, data: doctors });
  } catch (err) {
    next(err);
  }
});

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
