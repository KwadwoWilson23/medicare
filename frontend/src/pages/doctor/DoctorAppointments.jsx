import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { CalendarDays, Check, CheckCircle, XCircle } from 'lucide-react'

const STATUS_MAP = { Pending:'badge-pending', Confirmed:'badge-confirmed', Completed:'badge-completed', Cancelled:'badge-cancelled' }

export default function DoctorAppointments() {
  const { roleData } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [filter, setFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  const load = () => {
    if (!roleData?.id) return
    let url = `/doctors/${roleData.id}/appointments`
    if (dateFilter) url += `?date=${dateFilter}`
    api.get(url).then(r => {
      const filtered = filter ? r.data.filter(a => a.status === filter) : r.data
      setAppointments(filtered)
    })
  }

  useEffect(() => { load() }, [roleData, filter, dateFilter])

  const updateStatus = async (id, status, notes='') => {
    await api.patch(`/appointments/${id}/status`, { status, notes }); load()
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h2 style={{display:'flex',alignItems:'center',gap:'8px'}}><CalendarDays size={22}/> My Appointments</h2>
          <p>All your scheduled appointments</p>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <h3>Appointments ({appointments.length})</h3>
          <div style={{display:'flex',gap:'10px'}}>
            <input className="form-input" type="date" style={{width:'160px'}} value={dateFilter} onChange={e=>setDateFilter(e.target.value)} />
            <select className="form-select" style={{width:'150px'}} value={filter} onChange={e=>setFilter(e.target.value)}>
              <option value="">All</option>
              {['Pending','Confirmed','Completed','Cancelled'].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Patient</th><th>Date</th><th>Time</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {appointments.map(a=>(
                <tr key={a.id}>
                  <td><strong>{a.patient_name}</strong><br/><small style={{color:'var(--gray-400)'}}>{a.patient_phone}</small></td>
                  <td>{a.appointment_date}</td>
                  <td><strong style={{color:'var(--primary)'}}>{a.appointment_time}</strong></td>
                  <td><span className="badge badge-confirmed">{a.type}</span></td>
                  <td><span className={`badge ${STATUS_MAP[a.status]}`}>{a.status}</span></td>
                  <td>
                    <div style={{display:'flex',gap:'4px'}}>
                      {a.status==='Pending'&&<button className="btn btn-sm btn-success" onClick={()=>updateStatus(a.id,'Confirmed')} style={{display:'flex',alignItems:'center',gap:'4px'}}><Check size={12}/> Confirm</button>}
                      {a.status==='Confirmed'&&<button className="btn btn-sm btn-primary" onClick={()=>updateStatus(a.id,'Completed')} style={{display:'flex',alignItems:'center',gap:'4px'}}><CheckCircle size={12}/> Complete</button>}
                      {!['Cancelled','Completed'].includes(a.status)&&<button className="btn btn-sm btn-danger" onClick={()=>updateStatus(a.id,'Cancelled')} style={{display:'flex',alignItems:'center',gap:'4px'}}><XCircle size={12}/> Cancel</button>}
                    </div>
                  </td>
                </tr>
              ))}
              {!appointments.length&&<tr><td colSpan="6"><div className="empty-state"><CalendarDays size={48} style={{opacity:0.3}}/><p>No appointments</p></div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
