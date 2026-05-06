import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import { Users, CalendarDays, DollarSign, UserPlus, CalendarPlus, CreditCard, BellRing } from 'lucide-react'

export default function ReceptionistDashboard() {
  const [stats, setStats] = useState(null)
  const [appointments, setAppointments] = useState([])

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data))
    const today = new Date().toISOString().split('T')[0]
    api.get(`/appointments?date=${today}`).then(r => setAppointments(r.data))
  }, [])

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h2 style={{display:'flex',alignItems:'center',gap:'8px'}}><BellRing size={22}/> Front Desk</h2>
          <p>Today's operations & check-ins</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><Users size={26}/></div>
          <div className="stat-info"><h3>{stats?.patients || 0}</h3><p>Registered Patients</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><CalendarDays size={26}/></div>
          <div className="stat-info"><h3>{appointments.length}</h3><p>Today's Appointments</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><DollarSign size={26}/></div>
          <div className="stat-info"><h3>${stats?.revenue?.paid?.toLocaleString() || 0}</h3><p>Payments Collected</p></div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 style={{display:'flex',alignItems:'center',gap:'8px'}}><CalendarDays size={18}/> Today's Schedule</h3>
            <a href="/receptionist/appointments" className="btn btn-sm btn-secondary">Manage All</a>
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Time</th><th>Patient</th><th>Doctor</th><th>Status</th></tr></thead>
              <tbody>
                {appointments.slice(0, 5).map(a => (
                  <tr key={a.id}>
                    <td><strong style={{color:'var(--primary)'}}>{a.appointment_time}</strong></td>
                    <td><strong>{a.patient_name}</strong></td>
                    <td>Dr. {a.doctor_name}</td>
                    <td><span className={`badge ${a.status === 'Confirmed' ? 'badge-confirmed' : 'badge-pending'}`}>{a.status}</span></td>
                  </tr>
                ))}
                {!appointments.length && <tr><td colSpan="4"><div className="empty-state"><CalendarDays size={48} style={{opacity:0.3}}/><p>No appointments today</p></div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Quick Actions</h3></div>
          <div className="card-body" style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            <a href="/receptionist/patients" className="btn btn-primary" style={{padding:'16px',fontSize:'16px',justifyContent:'center',display:'flex',alignItems:'center',gap:'8px'}}><UserPlus size={18}/> Register New Patient</a>
            <a href="/receptionist/appointments" className="btn btn-secondary" style={{padding:'16px',fontSize:'16px',justifyContent:'center',display:'flex',alignItems:'center',gap:'8px'}}><CalendarPlus size={18}/> Book Appointment</a>
            <a href="/receptionist/billing" className="btn btn-secondary" style={{padding:'16px',fontSize:'16px',justifyContent:'center',color:'var(--success)',borderColor:'var(--success)',display:'flex',alignItems:'center',gap:'8px'}}><CreditCard size={18}/> Collect Payment</a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
