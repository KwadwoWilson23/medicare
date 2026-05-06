const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db/database');
const { authMiddleware, requireRole } = require('../middleware/auth');

// GET all billing records
router.get('/', authMiddleware, (req, res) => {
  const { status, patient_id } = req.query;
  let query = `
    SELECT b.*, u.name as patient_name, u.email as patient_email
    FROM billing b
    JOIN patients p ON b.patient_id = p.id
    JOIN users u ON p.user_id = u.id
    WHERE 1=1
  `;
  const params = [];
  if (status) { query += ' AND b.status = ?'; params.push(status); }
  if (patient_id) { query += ' AND b.patient_id = ?'; params.push(patient_id); }
  query += ' ORDER BY b.issued_date DESC';
  res.json(db.prepare(query).all(...params));
});

// GET single bill
router.get('/:id', authMiddleware, (req, res) => {
  const bill = db.prepare(`
    SELECT b.*, u.name as patient_name, u.email as patient_email, u.phone as patient_phone
    FROM billing b
    JOIN patients p ON b.patient_id = p.id
    JOIN users u ON p.user_id = u.id
    WHERE b.id = ?
  `).get(req.params.id);
  if (!bill) return res.status(404).json({ error: 'Bill not found' });
  res.json(bill);
});

// POST create bill manually
router.post('/', authMiddleware, requireRole('admin', 'receptionist'), (req, res) => {
  const { patient_id, appointment_id, amount, description, due_date } = req.body;
  if (!patient_id || !amount) return res.status(400).json({ error: 'Patient and amount required' });
  const id = uuidv4();
  db.prepare('INSERT INTO billing (id,patient_id,appointment_id,amount,description,status,due_date) VALUES (?,?,?,?,?,?,?)').run(
    id, patient_id, appointment_id || null, amount, description || 'Medical Bill', 'Pending', due_date || null
  );
  res.status(201).json({ id, message: 'Bill created' });
});

// PATCH mark as paid
router.patch('/:id/pay', authMiddleware, requireRole('admin', 'receptionist'), (req, res) => {
  const { payment_method } = req.body;
  db.prepare("UPDATE billing SET status='Paid', payment_method=?, paid_date=DATE('now') WHERE id=?").run(
    payment_method || 'Cash', req.params.id
  );
  res.json({ message: 'Payment recorded' });
});

// GET billing summary/stats
router.get('/stats/summary', authMiddleware, requireRole('admin', 'receptionist'), (req, res) => {
  const total = db.prepare('SELECT SUM(amount) as total FROM billing').get();
  const paid = db.prepare("SELECT SUM(amount) as total FROM billing WHERE status='Paid'").get();
  const pending = db.prepare("SELECT SUM(amount) as total FROM billing WHERE status='Pending'").get();
  const overdue = db.prepare("SELECT SUM(amount) as total FROM billing WHERE status='Overdue'").get();
  res.json({
    total: total.total || 0,
    paid: paid.total || 0,
    pending: pending.total || 0,
    overdue: overdue.total || 0
  });
});

module.exports = router;
