const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/analyze', async (req, res, next) => {
  try {
    const { symptoms, duration, severity } = req.body;
    let ai_result = { diagnosis: "Fallback diagnosis", advice: "Please consult a doctor." };
    let urgency = "medium";
    
    try {
      const response = await fetch(`${process.env.AI_SERVICE_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms, duration, severity })
      });
      if (response.ok) {
        const aiData = await response.json();
        ai_result = aiData.result;
        urgency = aiData.urgency || "medium";
      }
    } catch (e) {
      console.error('AI Service unavailable, using fallback');
    }
    
    let patient_id = null;
    if (req.user.role === 'patient') {
      const p = db.prepare('SELECT id FROM patients WHERE user_id = ?').get(req.user.id);
      if (p) patient_id = p.id;
    }
    
    if (patient_id) {
      const id = uuidv4();
      db.prepare(`
        INSERT INTO symptom_checks (id, patient_id, symptoms, duration, severity, ai_result, urgency) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, patient_id, JSON.stringify(symptoms), duration, severity, JSON.stringify(ai_result), urgency);
    }
    
    res.json({ success: true, data: { ai_result, urgency } });
  } catch (err) {
    next(err);
  }
});

router.get('/history', (req, res, next) => {
  try {
    if (req.user.role !== 'patient') return res.status(403).json({ success: false, error: 'Forbidden' });
    const p = db.prepare('SELECT id FROM patients WHERE user_id = ?').get(req.user.id);
    if (!p) return res.status(404).json({ success: false, error: 'Patient not found' });
    
    const history = db.prepare('SELECT * FROM symptom_checks WHERE patient_id = ? ORDER BY created_at DESC').all(p.id);
    history.forEach(h => {
      h.symptoms = JSON.parse(h.symptoms);
      h.ai_result = JSON.parse(h.ai_result);
    });
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
