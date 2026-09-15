const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/analyze', async (req, res, next) => {
  try {
    const { symptoms = [], duration = '1-3 days', severity = 'moderate', age, gender, additional_info } = req.body;
    let ai_result = null;
    let urgency = "moderate";
    
    // Attempt to call Python FastAPI microservice
    try {
      const response = await fetch(`${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          symptoms: Array.isArray(symptoms) ? symptoms : [symptoms], 
          duration, 
          severity, 
          age: age ? parseInt(age) : null, 
          gender: gender || null, 
          additional_info: additional_info || null 
        })
      });
      
      if (response.ok) {
        const aiData = await response.json();
        ai_result = aiData;
        urgency = aiData.urgency || "moderate";
      }
    } catch (e) {
      console.warn('AI Service unavailable, using internal rule-based inference fallback:', e.message);
    }
    
    // Internal fallback if python service is offline or returned error
    if (!ai_result) {
      const lowerSymptoms = (Array.isArray(symptoms) ? symptoms : [symptoms]).map(s => String(s).toLowerCase());
      const hasChestPain = lowerSymptoms.some(s => s.includes('chest pain'));
      const hasSOB = lowerSymptoms.some(s => s.includes('breath') || s.includes('breathing'));
      const isSevere = String(severity).toLowerCase() === 'severe';

      let calculatedUrgency = 'low';
      let urgencyLabel = 'Low Urgency';
      let urgencyColor = 'green';
      let conditions = [];

      if (hasChestPain && hasSOB) {
        calculatedUrgency = 'emergency';
        urgencyLabel = 'Emergency Attention Required';
        urgencyColor = 'red';
        conditions = [
          { condition: "Acute Coronary Syndrome / Angina", description: "Cardiovascular condition presenting with chest discomfort and breathing difficulty.", likelihood: "High", recommended_specialist: "Cardiologist" },
          { condition: "Pulmonary Embolism", description: "Blockage in pulmonary arteries causing chest pain and respiratory distress.", likelihood: "Moderate", recommended_specialist: "Pulmonologist" }
        ];
      } else if (isSevere || hasChestPain || hasSOB) {
        calculatedUrgency = 'high';
        urgencyLabel = 'High Urgency — Prompt Evaluation';
        urgencyColor = 'orange';
        conditions = [
          { condition: "Acute Respiratory Infection / Bronchitis", description: "Inflammation of bronchial pathways causing marked respiratory discomfort.", likelihood: "High", recommended_specialist: "Pulmonologist" },
          { condition: "Severe Systemic Viral Infection", description: "Systemic viral response presenting with pronounced somatic symptoms.", likelihood: "Moderate", recommended_specialist: "General Physician" }
        ];
      } else if (String(severity).toLowerCase() === 'moderate') {
        calculatedUrgency = 'moderate';
        urgencyLabel = 'Medical Consultation Recommended';
        urgencyColor = 'yellow';
        conditions = [
          { condition: "Viral Upper Respiratory Infection", description: "Common viral syndrome affecting upper respiratory mucosa.", likelihood: "High", recommended_specialist: "General Physician" },
          { condition: "Seasonal Allergies / Rhinitis", description: "Allergic response characterized by congestion, sneezing, and irritation.", likelihood: "Moderate", recommended_specialist: "General Physician" }
        ];
      } else {
        calculatedUrgency = 'low';
        urgencyLabel = 'Low Urgency — Home Care & Monitoring';
        urgencyColor = 'green';
        conditions = [
          { condition: "Mild Viral Syndrome", description: "Self-limiting mild viral symptoms suitable for home supportive care.", likelihood: "Moderate", recommended_specialist: "General Physician" }
        ];
      }

      urgency = calculatedUrgency;
      ai_result = {
        possible_conditions: conditions,
        urgency: calculatedUrgency,
        urgency_label: urgencyLabel,
        urgency_color: urgencyColor,
        recommendations: [
          calculatedUrgency === 'emergency' 
            ? "Seek immediate in-person emergency medical care or call emergency services." 
            : "Schedule an online consultation with a qualified doctor.",
          "Maintain proper hydration and rest.",
          "Monitor vital signs and seek immediate help if symptoms worsen."
        ],
        disclaimer: "AI-generated preliminary guidance only — not a medical diagnosis. Emergency symptoms require immediate in-person medical care.",
        follow_up_actions: [
          calculatedUrgency === 'emergency' 
            ? "Call emergency services immediately." 
            : "Book a consultation with a recommended specialist."
        ]
      };
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
    
    res.json({ success: true, data: ai_result });
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
      try { h.symptoms = JSON.parse(h.symptoms); } catch (e) { h.symptoms = []; }
      try { h.ai_result = JSON.parse(h.ai_result); } catch (e) { h.ai_result = {}; }
    });
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
