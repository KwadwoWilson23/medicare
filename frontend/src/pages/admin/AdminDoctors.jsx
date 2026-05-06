import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import { Stethoscope, Search, UserPlus, X, UserX } from 'lucide-react'

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({ name:'', email:'', phone:'', specialization:'', department:'', license_number:'', experience_years:'', consultation_fee:'' })

  const load = () => api.get('/doctors').then(r => setDoctors(r.data))
  useEffect(() => { load() }, [])
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const submit = async (e) => {
    e.preventDefault()
    try { await api.post('/doctors', form); setMsg('Doctor added!'); setShowModal(false); load() }
    catch(err) { setMsg('error:' + (err.response?.data?.error || 'Error')) }
  }

  const deactivate = async (id) => { if(!confirm('Deactivate?')) return; await api.delete(`/doctors/${id}`); load() }

  const filtered = doctors.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase()) ||
    d.department?.toLowerCase().includes(search.toLowerCase())
  )

  const SPECS = ['Cardiology','Neurology','Pediatrics','Orthopedics','Dermatology','Oncology','Radiology','General','Emergency','Psychiatry']

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h2 style={{display:'flex',alignItems:'center',gap:'8px'}}><Stethoscope size={22} /> Doctors</h2>
          <p>Manage medical staff and specialists</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{display:'flex',alignItems:'center',gap:'6px'}}><UserPlus size={16}/> Add Doctor</button>
      </div>

      {msg && <div className={`alert ${msg.startsWith('error:') ? 'alert-error' : 'alert-success'}`}>{msg.replace('error:','')} <button style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer'}} onClick={()=>setMsg('')}><X size={14}/></button></div>}

      <div className="card">
        <div className="card-header">
          <h3>Medical Staff ({filtered.length})</h3>
          <div className="search-bar" style={{width:'280px'}}>
            <span><Search size={16}/></span><input placeholder="Search doctors..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
        </div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Name</th><th>Specialization</th><th>Department</th><th>Experience</th><th>Fee</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                      <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'var(--primary)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'700',flexShrink:0}}>{d.name?.charAt(0)}</div>
                      <div><strong>{d.name}</strong><br/><small style={{color:'var(--gray-400)'}}>{d.email}</small></div>
                    </div>
                  </td>
                  <td><span className="badge badge-confirmed">{d.specialization}</span></td>
                  <td>{d.department}</td>
                  <td>{d.experience_years} yrs</td>
                  <td style={{fontWeight:'600',color:'var(--success)'}}>$ {d.consultation_fee}</td>
                  <td><span className={`badge ${d.is_active ? 'badge-completed' : 'badge-cancelled'}`}>{d.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td><button className="btn btn-sm btn-danger" onClick={() => deactivate(d.id)} style={{display:'flex',alignItems:'center',gap:'4px'}}><UserX size={12}/> Deactivate</button></td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan="7"><div className="empty-state"><Stethoscope size={48} style={{opacity:0.3}}/><p>No doctors found</p></div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal modal-lg">
            <div className="modal-header"><h3>Add New Doctor</h3><button className="modal-close" onClick={() => setShowModal(false)}><X size={16}/></button></div>
            <form onSubmit={submit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={form.name} onChange={e=>set('name',e.target.value)} required /></div>
                  <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" value={form.email} onChange={e=>set('email',e.target.value)} required /></div>
                </div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e=>set('phone',e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">License Number *</label><input className="form-input" value={form.license_number} onChange={e=>set('license_number',e.target.value)} required /></div>
                </div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Specialization *</label>
                    <select className="form-select" value={form.specialization} onChange={e=>set('specialization',e.target.value)} required>
                      <option value="">Select...</option>{SPECS.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Department *</label><input className="form-input" value={form.department} onChange={e=>set('department',e.target.value)} required /></div>
                </div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Experience (years)</label><input className="form-input" type="number" min="0" value={form.experience_years} onChange={e=>set('experience_years',e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Consultation Fee ($)</label><input className="form-input" type="number" min="0" value={form.consultation_fee} onChange={e=>set('consultation_fee',e.target.value)} /></div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Doctor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
