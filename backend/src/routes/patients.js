const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { db } = require('../db/database');
const { authMiddleware, requireRole } = require('../middleware/auth');

// GET all patients
router.get('/', authMiddleware, (req, res) => {
  const patients = db.prepare(`
    SELECT p.*, u.name, u.email, u.phone, u.created_at, u.is_active
    FROM patients p
    JOIN users u ON p.user_id = u.id
    ORDER BY u.name ASC
  `).all();
  res.json(patients);
});

// GET single patient
router.get('/:id', authMiddleware, (req, res) => {
  const patient = db.prepare(`
    SELECT p.*, u.name, u.email, u.phone, u.created_at
    FROM patients p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `).get(req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  res.json(patient);
});

// GET patient by user_id
router.get('/by-user/:userId', authMiddleware, (req, res) => {
  const patient = db.prepare(`
    SELECT p.*, u.name, u.email, u.phone, u.created_at
    FROM patients p
    JOIN users u ON p.user_id = u.id
    WHERE p.user_id = ?
  `).get(req.params.userId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  res.json(patient);
});

// POST create patient (admin/receptionist)
router.post('/', authMiddleware, requireRole('admin', 'receptionist'), (req, res) => {
  const { name, email, password, phone, date_of_birth, gender, blood_type, allergies, emergency_contact, insurance_number } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email required' });

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return res.status(400).json({ error: 'Email already registered' });

  const userId = uuidv4();
  const patientId = uuidv4();
  const hashed = bcrypt.hashSync(password || 'patient123', 10);

  db.prepare('INSERT INTO users (id,name,email,password,role,phone) VALUES (?,?,?,?,?,?)').run(
    userId, name, email, hashed, 'patient', phone || null
  );
  db.prepare(`INSERT INTO patients (id,user_id,date_of_birth,gender,blood_type,allergies,emergency_contact,insurance_number)
    VALUES (?,?,?,?,?,?,?,?)`).run(
    patientId, userId, date_of_birth || null, gender || null, blood_type || null,
    allergies || null, emergency_contact || null, insurance_number || null
  );

  res.status(201).json({ id: patientId, user_id: userId, name, email });
});

// PUT update patient
router.put('/:id', authMiddleware, (req, res) => {
  const { date_of_birth, gender, blood_type, allergies, emergency_contact, medical_history, insurance_number, phone } = req.body;
  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  db.prepare(`UPDATE patients SET date_of_birth=?,gender=?,blood_type=?,allergies=?,emergency_contact=?,medical_history=?,insurance_number=? WHERE id=?`).run(
    date_of_birth, gender, blood_type, allergies, emergency_contact, medical_history, insurance_number, req.params.id
  );
  if (phone) db.prepare('UPDATE users SET phone=? WHERE id=?').run(phone, patient.user_id);

  res.json({ message: 'Patient updated successfully' });
});

// DELETE patient (admin only)
router.delete('/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  db.prepare('UPDATE users SET is_active=0 WHERE id=?').run(patient.user_id);
  res.json({ message: 'Patient deactivated' });
});

module.exports = router;
