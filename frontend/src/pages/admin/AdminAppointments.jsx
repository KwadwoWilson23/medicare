import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import { CalendarDays, Search, CalendarPlus, X, Check, CheckCircle, XCircle } from 'lucide-react'

const STATUS_MAP = { Pending:'badge-pending', Confirmed:'badge-confirmed', Completed:'badge-completed', Cancelled:'badge-cancelled' }

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([])
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [doctors, setDoctors] = useState([])
  const [patients, setPatients] = useState([])
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({ patient_id:'', doctor_id:'', appointment_date:'', appointment_time:'', type:'General', reason:'' })

  const load = () => {
    const params = filter ? `?status=${filter}` : ''
    api.get(`/appointments${params}`).then(r => setAppointments(r.data))
  }
  useEffect(() => { load() }, [filter])
  useEffect(() => {
    api.get('/doctors').then(r => setDoctors(r.data))
    api.get('/patients').then(r => setPatients(r.data))
  }, [])

  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const submit = async (e) => {
    e.preventDefault()
    try { await api.post('/appointments', form); setMsg('Appointment booked!'); setShowModal(false); load() }
    catch(err) { setMsg('error:' + (err.response?.data?.error || 'Error')) }
  }

  const updateStatus = async (id, status) => {
    await api.patch(`/appointments/${id}/status`, { status }); load()
  }

  const filtered = appointments.filter(a =>
    a.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.doctor_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h2 style={{display:'flex',alignItems:'center',gap:'8px'}}><CalendarDays size={22}/> Appointments</h2>
          <p>All hospital appointments</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{display:'flex',alignItems:'center',gap:'6px'}}><CalendarPlus size={16}/> Book Appointment</button>
      </div>

      {msg && <div className={`alert ${msg.startsWith('error:') ? 'alert-error':'alert-success'}`}>{msg.replace('error:','')}<button style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer'}} onClick={()=>setMsg('')}><X size={14}/></button></div>}

      <div className="card">
        <div className="card-header">
          <h3>Appointments ({filtered.length})</h3>
          <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
            <select className="form-select" style={{width:'160px'}} value={filter} onChange={e=>setFilter(e.target.value)}>
              <option value="">All Statuses</option>
              {['Pending','Confirmed','Completed','Cancelled'].map(s=><option key={s}>{s}</option>)}
            </select>
            <div className="search-bar" style={{width:'240px'}}><span><Search size={16}/></span><input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} /></div>
          </div>
        </div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Patient</th><th>Doctor</th><th>Date & Time</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id}>
                  <td><strong>{a.patient_name}</strong><br/><small style={{color:'var(--gray-400)'}}>{a.patient_phone}</small></td>
                  <td>{a.doctor_name}<br/><small style={{color:'var(--gray-400)'}}>{a.specialization}</small></td>
                  <td><strong>{a.appointment_date}</strong><br/><small>{a.appointment_time}</small></td>
                  <td><span className="badge badge-confirmed">{a.type}</span></td>
                  <td><span className={`badge ${STATUS_MAP[a.status]}`}>{a.status}</span></td>
                  <td>
                    <div style={{display:'flex',gap:'4px',flexWrap:'wrap'}}>
                      {a.status === 'Pending' && <button className="btn btn-sm btn-success" onClick={()=>updateStatus(a.id,'Confirmed')} style={{display:'flex',alignItems:'center',gap:'4px'}}><Check size={12}/> Confirm</button>}
                      {a.status === 'Confirmed' && <button className="btn btn-sm btn-primary" onClick={()=>updateStatus(a.id,'Completed')} style={{display:'flex',alignItems:'center',gap:'4px'}}><CheckCircle size={12}/> Complete</button>}
                      {!['Cancelled','Completed'].includes(a.status) && <button className="btn btn-sm btn-danger" onClick={()=>updateStatus(a.id,'Cancelled')} style={{display:'flex',alignItems:'center',gap:'4px'}}><XCircle size={12}/> Cancel</button>}
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan="6"><div className="empty-state"><CalendarDays size={48} style={{opacity:0.3}}/><p>No appointments found</p></div></td></tr>}
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
                <div className="form-group"><label className="form-label">Patient *</label>
                  <select className="form-select" value={form.patient_id} onChange={e=>set('patient_id',e.target.value)} required>
                    <option value="">Select patient...</option>
                    {patients.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Doctor *</label>
                  <select className="form-select" value={form.doctor_id} onChange={e=>set('doctor_id',e.target.value)} required>
                    <option value="">Select doctor...</option>
                    {doctors.map(d=><option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>)}
                  </select>
                </div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Date *</label><input className="form-input" type="date" value={form.appointment_date} onChange={e=>set('appointment_date',e.target.value)} required /></div>
                  <div className="form-group"><label className="form-label">Time *</label><input className="form-input" type="time" value={form.appointment_time} onChange={e=>set('appointment_time',e.target.value)} required /></div>
                </div>
                <div className="form-group"><label className="form-label">Type</label>
                  <select className="form-select" value={form.type} onChange={e=>set('type',e.target.value)}>
                    {['General','Follow-up','Emergency','Specialist'].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Reason</label><textarea className="form-textarea" value={form.reason} onChange={e=>set('reason',e.target.value)} placeholder="Reason for visit..." /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Book Appointment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
