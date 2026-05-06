const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db/database');
const { authMiddleware, requireRole } = require('../middleware/auth');

// GET all medical records
router.get('/', authMiddleware, (req, res) => {
  const { patient_id, doctor_id } = req.query;
  let query = `
    SELECT mr.*, pu.name as patient_name, du.name as doctor_name, d.specialization
    FROM medical_records mr
    JOIN patients p ON mr.patient_id = p.id
    JOIN users pu ON p.user_id = pu.id
    JOIN doctors d ON mr.doctor_id = d.id
    JOIN users du ON d.user_id = du.id
    WHERE 1=1
  `;
  const params = [];
  if (patient_id) { query += ' AND mr.patient_id = ?'; params.push(patient_id); }
  if (doctor_id) { query += ' AND mr.doctor_id = ?'; params.push(doctor_id); }
  query += ' ORDER BY mr.created_at DESC';
  res.json(db.prepare(query).all(...params));
});

// POST create medical record
router.post('/', authMiddleware, requireRole('doctor', 'admin'), (req, res) => {
  const { patient_id, doctor_id, appointment_id, diagnosis, treatment, prescription, lab_results } = req.body;
  if (!patient_id || !doctor_id) return res.status(400).json({ error: 'Patient and doctor required' });
  const id = uuidv4();
  db.prepare(`INSERT INTO medical_records (id,patient_id,doctor_id,appointment_id,diagnosis,treatment,prescription,lab_results)
    VALUES (?,?,?,?,?,?,?,?)`).run(id, patient_id, doctor_id, appointment_id || null, diagnosis, treatment, prescription, lab_results);
  res.status(201).json({ id, message: 'Medical record created' });
});

// GET all vitals for a patient
router.get('/vitals/:patientId', authMiddleware, (req, res) => {
  const vitals = db.prepare(`
    SELECT v.*, u.name as nurse_name
    FROM vitals v
    JOIN nurses n ON v.nurse_id = n.id
    JOIN users u ON n.user_id = u.id
    WHERE v.patient_id = ?
    ORDER BY v.recorded_at DESC
    LIMIT 20
  `).all(req.params.patientId);
  res.json(vitals);
});

// POST record vitals
router.post('/vitals', authMiddleware, requireRole('nurse', 'doctor', 'admin'), (req, res) => {
  const { patient_id, nurse_id, blood_pressure, heart_rate, temperature, oxygen_saturation, weight, height } = req.body;
  if (!patient_id || !nurse_id) return res.status(400).json({ error: 'Patient and nurse required' });
  const id = uuidv4();
  db.prepare(`INSERT INTO vitals (id,patient_id,nurse_id,blood_pressure,heart_rate,temperature,oxygen_saturation,weight,height)
    VALUES (?,?,?,?,?,?,?,?,?)`).run(id, patient_id, nurse_id, blood_pressure, heart_rate, temperature, oxygen_saturation, weight, height);
  res.status(201).json({ id, message: 'Vitals recorded' });
});

module.exports = router;
