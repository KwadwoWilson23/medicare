const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db/database');
const { authMiddleware, requireRole } = require('../middleware/auth');

// GET all appointments
router.get('/', authMiddleware, (req, res) => {
  const { status, date, doctor_id, patient_id } = req.query;
  let query = `
    SELECT a.*,
      pu.name as patient_name, pu.phone as patient_phone,
      du.name as doctor_name, d.specialization, d.department
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN users pu ON p.user_id = pu.id
    JOIN doctors d ON a.doctor_id = d.id
    JOIN users du ON d.user_id = du.id
    WHERE 1=1
  `;
  const params = [];
  if (status) { query += ' AND a.status = ?'; params.push(status); }
  if (date) { query += ' AND a.appointment_date = ?'; params.push(date); }
  if (doctor_id) { query += ' AND a.doctor_id = ?'; params.push(doctor_id); }
  if (patient_id) { query += ' AND a.patient_id = ?'; params.push(patient_id); }
  query += ' ORDER BY a.appointment_date DESC, a.appointment_time ASC';
  res.json(db.prepare(query).all(...params));
});

// GET single appointment
router.get('/:id', authMiddleware, (req, res) => {
  const appt = db.prepare(`
    SELECT a.*,
      pu.name as patient_name, pu.phone as patient_phone, pu.email as patient_email,
      du.name as doctor_name, d.specialization, d.department, d.consultation_fee
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN users pu ON p.user_id = pu.id
    JOIN doctors d ON a.doctor_id = d.id
    JOIN users du ON d.user_id = du.id
    WHERE a.id = ?
  `).get(req.params.id);
  if (!appt) return res.status(404).json({ error: 'Appointment not found' });
  res.json(appt);
});

// POST create appointment
router.post('/', authMiddleware, (req, res) => {
  const { patient_id, doctor_id, appointment_date, appointment_time, type, reason } = req.body;
  if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  // Check for conflicts
  const conflict = db.prepare(`
    SELECT id FROM appointments
    WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ? AND status != 'Cancelled'
  `).get(doctor_id, appointment_date, appointment_time);
  if (conflict) return res.status(409).json({ error: 'Time slot already booked' });

  const id = uuidv4();
  db.prepare(`INSERT INTO appointments (id,patient_id,doctor_id,appointment_date,appointment_time,type,reason,status)
    VALUES (?,?,?,?,?,?,?,'Pending')`).run(id, patient_id, doctor_id, appointment_date, appointment_time, type || 'General', reason || null);

  // Auto-generate billing
  const doctor = db.prepare('SELECT consultation_fee FROM doctors WHERE id = ?').get(doctor_id);
  const billId = uuidv4();
  db.prepare(`INSERT INTO billing (id,patient_id,appointment_id,amount,description,status,due_date)
    VALUES (?,?,?,?,?,?,?)`).run(
    billId, patient_id, id, doctor?.consultation_fee || 100,
    'Consultation Fee', 'Pending',
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );

  res.status(201).json({ id, message: 'Appointment booked successfully' });
});

// PATCH update appointment status
router.patch('/:id/status', authMiddleware, (req, res) => {
  const { status, notes } = req.body;
  const valid = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  db.prepare('UPDATE appointments SET status=?, notes=? WHERE id=?').run(status, notes || null, req.params.id);
  res.json({ message: 'Appointment status updated' });
});

// PUT update appointment
router.put('/:id', authMiddleware, (req, res) => {
  const { appointment_date, appointment_time, type, reason, notes } = req.body;
  db.prepare('UPDATE appointments SET appointment_date=?,appointment_time=?,type=?,reason=?,notes=? WHERE id=?').run(
    appointment_date, appointment_time, type, reason, notes, req.params.id
  );
  res.json({ message: 'Appointment updated' });
});

// DELETE appointment
router.delete('/:id', authMiddleware, (req, res) => {
  db.prepare("UPDATE appointments SET status='Cancelled' WHERE id=?").run(req.params.id);
  res.json({ message: 'Appointment cancelled' });
});

module.exports = router;
