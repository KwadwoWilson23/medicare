import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { CalendarDays, CalendarPlus, XCircle, X } from 'lucide-react'

const STATUS_MAP = { Pending:'badge-pending', Confirmed:'badge-confirmed', Completed:'badge-completed', Cancelled:'badge-cancelled' }

export default function PatientAppointments() {
  const { roleData } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({ doctor_id:'', appointment_date:'', appointment_time:'', reason:'' })

  const load = () => {
    if (!roleData?.id) return
    api.get(`/appointments?patient_id=${roleData.id}`).then(r => setAppointments(r.data))
  }
  useEffect(() => { 
    load()
    api.get('/doctors').then(r => setDoctors(r.data))
  }, [roleData])

  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const submit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/appointments', { ...form, patient_id: roleData.id, type: 'General' })
      setMsg('Appointment booked successfully!')
      setShowModal(false)
      load()
    } catch(err) { setMsg('error:' + (err.response?.data?.error || 'Error booking appointment')) }
  }

  const cancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return
    await api.delete(`/appointments/${id}`); load()
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h2 style={{display:'flex',alignItems:'center',gap:'8px'}}><CalendarDays size={22}/> My Appointments</h2>
          <p>Manage your upcoming visits</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{display:'flex',alignItems:'center',gap:'6px'}}><CalendarPlus size={16}/> Book Appointment</button>
      </div>

      {msg && <div className={`alert ${msg.startsWith('error:') ? 'alert-error' : 'alert-success'}`}>{msg.replace('error:','')}<button style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer'}} onClick={()=>setMsg('')}><X size={14}/></button></div>}

      <div className="card">
        <div className="card-header"><h3>Your Appointments ({appointments.length})</h3></div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Date & Time</th><th>Doctor</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {appointments.map(a => (
                <tr key={a.id}>
                  <td><strong>{a.appointment_date}</strong><br/><small>{a.appointment_time}</small></td>
                  <td>{a.doctor_name}<br/><small style={{color:'var(--gray-400)'}}>{a.specialization}</small></td>
                  <td>{a.reason || '—'}</td>
                  <td><span className={`badge ${STATUS_MAP[a.status]}`}>{a.status}</span></td>
                  <td>
                    {['Pending','Confirmed'].includes(a.status) && (
                      <button className="btn btn-sm btn-danger" onClick={()=>cancel(a.id)} style={{display:'flex',alignItems:'center',gap:'4px'}}><XCircle size={12}/> Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
              {!appointments.length && <tr><td colSpan="5"><div className="empty-state"><CalendarDays size={48} style={{opacity:0.3}}/><p>No appointments found</p></div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className="modal">
            <div className="modal-header"><h3>Book Appointment</h3><button className="modal-close" onClick={()=>setShowModal(false)}><X size={16}/></button></div>
            <form onSubmit={submit}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Select Doctor *</label>
                  <select className="form-select" value={form.doctor_id} onChange={e=>set('doctor_id',e.target.value)} required>
                    <option value="">Choose a doctor...</option>
                    {doctors.map(d=><option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>)}
                  </select>
                </div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Date *</label><input className="form-input" type="date" value={form.appointment_date} onChange={e=>set('appointment_date',e.target.value)} min={new Date().toISOString().split('T')[0]} required /></div>
                  <div className="form-group"><label className="form-label">Time *</label><input className="form-input" type="time" value={form.appointment_time} onChange={e=>set('appointment_time',e.target.value)} required /></div>
                </div>
                <div className="form-group"><label className="form-label">Reason for Visit</label><textarea className="form-textarea" value={form.reason} onChange={e=>set('reason',e.target.value)} placeholder="Briefly describe your symptoms..." /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
