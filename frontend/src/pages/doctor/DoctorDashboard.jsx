import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { CalendarDays, Clock, CheckCircle, Flag, Check } from 'lucide-react'

const STATUS_MAP = { Pending:'badge-pending', Confirmed:'badge-confirmed', Completed:'badge-completed', Cancelled:'badge-cancelled' }

export default function DoctorDashboard() {
  const { user, roleData } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!roleData?.id) return
    const today = new Date().toISOString().split('T')[0]
    api.get(`/doctors/${roleData.id}/appointments?date=${today}`)
      .then(r => { setAppointments(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [roleData])

  const updateStatus = async (id, status) => {
    await api.patch(`/appointments/${id}/status`, { status })
    const today = new Date().toISOString().split('T')[0]
    api.get(`/doctors/${roleData.id}/appointments?date=${today}`).then(r => setAppointments(r.data))
  }

  const pending = appointments.filter(a => a.status === 'Pending').length
  const confirmed = appointments.filter(a => a.status === 'Confirmed').length
  const completed = appointments.filter(a => a.status === 'Completed').length

  return (
    <DashboardLayout>
      <div style={{background:'linear-gradient(135deg,var(--primary-dark),var(--primary))',borderRadius:'16px',padding:'28px',color:'white',marginBottom:'24px'}}>
        <h2 style={{fontSize:'22px',fontWeight:'800',marginBottom:'4px'}}>Good {new Date().getHours()<12?'Morning':'Afternoon'}, {user?.name?.split(' ')[0]}</h2>
        <p style={{opacity:0.8}}>Here's your schedule for today — {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</p>
      </div>

      <div className="stats-grid">
        {[
          {icon: CalendarDays, color:'blue',label:"Today's Total",value:appointments.length},
          {icon: Clock, color:'orange',label:'Pending',value:pending},
          {icon: CheckCircle, color:'green',label:'Confirmed',value:confirmed},
          {icon: Flag, color:'cyan',label:'Completed',value:completed},
        ].map(s=>{
          const Icon = s.icon
          return (
            <div className="stat-card" key={s.label}>
              <div className={`stat-icon ${s.color}`}><Icon size={26}/></div>
              <div className="stat-info"><h3>{s.value}</h3><p>{s.label}</p></div>
            </div>
          )
        })}
      </div>

      <div className="card mt-24">
        <div className="card-header"><h3 style={{display:'flex',alignItems:'center',gap:'8px'}}><CalendarDays size={18}/> Today's Appointments</h3></div>
        <div className="table-wrapper">
          {loading ? <div className="loading-spinner"><div className="spinner"/></div> : (
            <table>
              <thead><tr><th>Time</th><th>Patient</th><th>Type</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {appointments.length ? appointments.map(a=>(
                  <tr key={a.id}>
                    <td><strong style={{color:'var(--primary)'}}>{a.appointment_time}</strong></td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                        <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'var(--primary-pale)',color:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'700',fontSize:'12px'}}>{a.patient_name?.charAt(0)}</div>
                        <div><strong>{a.patient_name}</strong><br/><small style={{color:'var(--gray-400)'}}>{a.patient_phone}</small></div>
                      </div>
                    </td>
                    <td><span className="badge badge-confirmed">{a.type}</span></td>
                    <td style={{maxWidth:'180px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{a.reason||'—'}</td>
                    <td><span className={`badge ${STATUS_MAP[a.status]}`}>{a.status}</span></td>
                    <td>
                      <div style={{display:'flex',gap:'4px'}}>
                        {a.status==='Pending'&&<button className="btn btn-sm btn-success" onClick={()=>updateStatus(a.id,'Confirmed')} style={{display:'flex',alignItems:'center',gap:'4px'}}><Check size={12}/> Confirm</button>}
                        {a.status==='Confirmed'&&<button className="btn btn-sm btn-primary" onClick={()=>updateStatus(a.id,'Completed')} style={{display:'flex',alignItems:'center',gap:'4px'}}><CheckCircle size={12}/> Complete</button>}
                      </div>
                    </td>
                  </tr>
                )):<tr><td colSpan="6"><div className="empty-state"><CalendarDays size={48} style={{opacity:0.3}}/><p>No appointments today</p></div></td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
