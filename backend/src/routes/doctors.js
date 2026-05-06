const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { db } = require('../db/database');
const { authMiddleware, requireRole } = require('../middleware/auth');

// GET all doctors
router.get('/', authMiddleware, (req, res) => {
  const doctors = db.prepare(`
    SELECT d.*, u.name, u.email, u.phone, u.is_active
    FROM doctors d
    JOIN users u ON d.user_id = u.id
    ORDER BY u.name ASC
  `).all();
  res.json(doctors);
});

// GET single doctor
router.get('/:id', authMiddleware, (req, res) => {
  const doctor = db.prepare(`
    SELECT d.*, u.name, u.email, u.phone
    FROM doctors d
    JOIN users u ON d.user_id = u.id
    WHERE d.id = ?
  `).get(req.params.id);
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
  res.json(doctor);
});

// GET doctor by user_id
router.get('/by-user/:userId', authMiddleware, (req, res) => {
  const doctor = db.prepare(`
    SELECT d.*, u.name, u.email, u.phone
    FROM doctors d
    JOIN users u ON d.user_id = u.id
    WHERE d.user_id = ?
  `).get(req.params.userId);
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
  res.json(doctor);
});

// POST create doctor (admin only)
router.post('/', authMiddleware, requireRole('admin'), (req, res) => {
  const { name, email, password, phone, specialization, department, license_number, experience_years, consultation_fee } = req.body;
  if (!name || !email || !specialization || !department || !license_number) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return res.status(400).json({ error: 'Email already registered' });

  const userId = uuidv4();
  const doctorId = uuidv4();
  const hashed = bcrypt.hashSync(password || 'doctor123', 10);

  db.prepare('INSERT INTO users (id,name,email,password,role,phone) VALUES (?,?,?,?,?,?)').run(
    userId, name, email, hashed, 'doctor', phone || null
  );
  db.prepare(`INSERT INTO doctors (id,user_id,specialization,department,license_number,experience_years,consultation_fee)
    VALUES (?,?,?,?,?,?,?)`).run(
    doctorId, userId, specialization, department, license_number,
    experience_years || 0, consultation_fee || 100
  );

  res.status(201).json({ id: doctorId, user_id: userId, name, email, specialization });
});

// PUT update doctor
router.put('/:id', authMiddleware, requireRole('admin', 'doctor'), (req, res) => {
  const { specialization, department, experience_years, consultation_fee, available_days, shift_start, shift_end } = req.body;
  db.prepare(`UPDATE doctors SET specialization=?,department=?,experience_years=?,consultation_fee=?,available_days=?,shift_start=?,shift_end=? WHERE id=?`).run(
    specialization, department, experience_years, consultation_fee, available_days, shift_start, shift_end, req.params.id
  );
  res.json({ message: 'Doctor updated successfully' });
});

// DELETE doctor (admin)
router.delete('/:id', authMiddleware, requireRole('admin'), (req, res) => {
  const doctor = db.prepare('SELECT * FROM doctors WHERE id = ?').get(req.params.id);
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
  db.prepare('UPDATE users SET is_active=0 WHERE id=?').run(doctor.user_id);
  res.json({ message: 'Doctor deactivated' });
});

// GET doctor's appointments
router.get('/:id/appointments', authMiddleware, (req, res) => {
  const { date } = req.query;
  let query = `
    SELECT a.*, p.id as patient_record_id, u.name as patient_name, u.phone as patient_phone
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN users u ON p.user_id = u.id
    WHERE a.doctor_id = ?
  `;
  const params = [req.params.id];
  if (date) { query += ' AND a.appointment_date = ?'; params.push(date); }
  query += ' ORDER BY a.appointment_date ASC, a.appointment_time ASC';
  res.json(db.prepare(query).all(...params));
});

module.exports = router;
