import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { CalendarClock, ClipboardList, CalendarPlus } from 'lucide-react'

export default function PatientDashboard() {
  const { user, roleData } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [records, setRecords] = useState([])

  useEffect(() => {
    if (!roleData?.id) return
    api.get(`/appointments?patient_id=${roleData.id}`).then(r => setAppointments(r.data))
    api.get(`/records?patient_id=${roleData.id}`).then(r => setRecords(r.data))
  }, [roleData])

  const nextAppt = appointments.filter(a => a.status === 'Confirmed' || a.status === 'Pending')
    .sort((a,b) => new Date(a.appointment_date) - new Date(b.appointment_date))[0]

  return (
    <DashboardLayout>
      <div style={{background:'linear-gradient(135deg,var(--primary-dark),var(--primary))',borderRadius:'16px',padding:'28px',color:'white',marginBottom:'24px'}}>
        <h2 style={{fontSize:'22px',fontWeight:'800',marginBottom:'4px'}}>Hello, {user?.name?.split(' ')[0]}</h2>
        <p style={{opacity:0.8}}>Welcome to your personal health dashboard.</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><h3 style={{display:'flex',alignItems:'center',gap:'8px'}}><CalendarClock size={18}/> Next Appointment</h3></div>
          <div className="card-body">
            {nextAppt ? (
              <div style={{display:'flex',gap:'16px',alignItems:'center'}}>
                <div style={{background:'var(--primary-pale)',padding:'16px',borderRadius:'12px',textAlign:'center',minWidth:'80px'}}>
                  <div style={{fontSize:'12px',fontWeight:'700',color:'var(--primary)',textTransform:'uppercase'}}>{new Date(nextAppt.appointment_date).toLocaleDateString('en-US',{month:'short'})}</div>
                  <div style={{fontSize:'24px',fontWeight:'800',color:'var(--primary)'}}>{new Date(nextAppt.appointment_date).getDate()}</div>
                </div>
                <div>
                  <h4 style={{fontSize:'16px',marginBottom:'4px'}}>{nextAppt.doctor_name}</h4>
                  <p style={{fontSize:'13px',color:'var(--gray-500)',marginBottom:'8px'}}>{nextAppt.specialization} • {nextAppt.appointment_time}</p>
                  <span className={`badge ${nextAppt.status === 'Confirmed' ? 'badge-confirmed' : 'badge-pending'}`}>{nextAppt.status}</span>
                </div>
              </div>
            ) : (
              <div className="empty-state" style={{padding:'20px 0'}}><p>No upcoming appointments</p></div>
            )}
            <div style={{marginTop:'20px'}}>
              <a href="/patient/appointments" className="btn btn-primary" style={{width:'100%',justifyContent:'center',display:'flex',alignItems:'center',gap:'8px'}}><CalendarPlus size={16}/> Book New Appointment</a>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 style={{display:'flex',alignItems:'center',gap:'8px'}}><ClipboardList size={18}/> Recent Medical Records</h3>
            <a href="/patient/records" className="btn btn-sm btn-secondary">View All</a>
          </div>
          <div className="table-wrapper">
            <table>
              <tbody>
                {records.slice(0,3).map(r => (
                  <tr key={r.id}>
                    <td>
                      <strong>{new Date(r.created_at).toLocaleDateString()}</strong><br/>
                      <small style={{color:'var(--gray-500)'}}>Dr. {r.doctor_name}</small>
                    </td>
                    <td>{r.diagnosis || 'General Checkup'}</td>
                  </tr>
                ))}
                {!records.length && <tr><td><div className="empty-state" style={{padding:'20px 0'}}><p>No medical records</p></div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
