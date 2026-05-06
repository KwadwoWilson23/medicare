const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const { authMiddleware, requireRole } = require('../middleware/auth');

// GET admin dashboard stats
router.get('/stats', authMiddleware, requireRole('admin'), (req, res) => {
  const totalPatients = db.prepare("SELECT COUNT(*) as count FROM users WHERE role='patient' AND is_active=1").get();
  const totalDoctors = db.prepare("SELECT COUNT(*) as count FROM users WHERE role='doctor' AND is_active=1").get();
  const totalNurses = db.prepare("SELECT COUNT(*) as count FROM users WHERE role='nurse' AND is_active=1").get();
  const totalAppointments = db.prepare("SELECT COUNT(*) as count FROM appointments").get();
  const pendingAppt = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status='Pending'").get();
  const todayAppt = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE appointment_date=DATE('now')").get();
  const totalRevenue = db.prepare("SELECT SUM(amount) as total FROM billing WHERE status='Paid'").get();
  const pendingBills = db.prepare("SELECT SUM(amount) as total FROM billing WHERE status='Pending'").get();
  const wardStats = db.prepare("SELECT SUM(capacity) as total_beds, SUM(occupied) as occupied_beds FROM wards").get();
  const recentAppointments = db.prepare(`
    SELECT a.*, pu.name as patient_name, du.name as doctor_name, d.specialization
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN users pu ON p.user_id = pu.id
    JOIN doctors d ON a.doctor_id = d.id
    JOIN users du ON d.user_id = du.id
    ORDER BY a.created_at DESC LIMIT 5
  `).all();

  res.json({
    patients: totalPatients.count,
    doctors: totalDoctors.count,
    nurses: totalNurses.count,
    appointments: { total: totalAppointments.count, pending: pendingAppt.count, today: todayAppt.count },
    revenue: { total: totalRevenue.total || 0, pending: pendingBills.total || 0 },
    wards: wardStats,
    recentAppointments
  });
});

// GET all wards
router.get('/wards', authMiddleware, (req, res) => {
  res.json(db.prepare('SELECT * FROM wards ORDER BY name').all());
});

// GET all staff
router.get('/staff', authMiddleware, requireRole('admin'), (req, res) => {
  const staff = db.prepare("SELECT id, name, email, role, phone, created_at, is_active FROM users WHERE role != 'patient' ORDER BY name").all();
  res.json(staff);
});

module.exports = router;
