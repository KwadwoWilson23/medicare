const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db/database');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = db.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1').get(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const match = bcrypt.compareSync(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  // Get role-specific data
  let roleData = null;
  if (user.role === 'doctor') {
    roleData = db.prepare('SELECT * FROM doctors WHERE user_id = ?').get(user.id);
  } else if (user.role === 'patient') {
    roleData = db.prepare('SELECT * FROM patients WHERE user_id = ?').get(user.id);
  } else if (user.role === 'nurse') {
    roleData = db.prepare('SELECT * FROM nurses WHERE user_id = ?').get(user.id);
  }

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
    roleData
  });
});

// POST /api/auth/register (patient self-registration)
router.post('/register', (req, res) => {
  const { name, email, password, phone, date_of_birth, gender, blood_type } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return res.status(400).json({ error: 'Email already registered' });

  const userId = uuidv4();
  const patientId = uuidv4();
  const hashed = bcrypt.hashSync(password, 10);

  db.prepare('INSERT INTO users (id,name,email,password,role,phone) VALUES (?,?,?,?,?,?)').run(
    userId, name, email, hashed, 'patient', phone || null
  );
  db.prepare('INSERT INTO patients (id,user_id,date_of_birth,gender,blood_type) VALUES (?,?,?,?,?)').run(
    patientId, userId, date_of_birth || null, gender || null, blood_type || null
  );

  const token = jwt.sign(
    { id: userId, email, role: 'patient', name },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.status(201).json({
    token,
    user: { id: userId, name, email, role: 'patient', phone },
    roleData: { id: patientId, user_id: userId }
  });
});

module.exports = router;
