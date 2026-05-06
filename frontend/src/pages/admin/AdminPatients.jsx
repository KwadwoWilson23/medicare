import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import { Users, Search, UserPlus, X, UserX } from 'lucide-react'

export default function AdminPatients() {
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name:'', email:'', phone:'', gender:'', date_of_birth:'', blood_type:'', emergency_contact:'' })
  const [msg, setMsg] = useState('')

  const load = () => api.get('/patients').then(r => { setPatients(r.data); setLoading(false) })
  useEffect(() => { load() }, [])

  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const submit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/patients', form)
      setMsg('Patient registered successfully!')
      setShowModal(false)
      setForm({ name:'',email:'',phone:'',gender:'',date_of_birth:'',blood_type:'',emergency_contact:'' })
      load()
    } catch(err) { setMsg('error:' + (err.response?.data?.error || 'Error registering patient')) }
  }

  const deactivate = async (id) => {
    if (!confirm('Deactivate this patient?')) return
    await api.delete(`/patients/${id}`); load()
  }

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h2 style={{display:'flex',alignItems:'center',gap:'8px'}}><Users size={22} /> Patients</h2>
          <p>Manage all registered patients</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{display:'flex',alignItems:'center',gap:'6px'}}><UserPlus size={16} /> Register Patient</button>
      </div>

      {msg && <div className={`alert ${msg.startsWith('error:') ? 'alert-error' : 'alert-success'}`}>{msg.replace('error:','')}<button style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer'}} onClick={()=>setMsg('')}><X size={14}/></button></div>}

      <div className="card">
        <div className="card-header">
          <h3>All Patients ({filtered.length})</h3>
          <div className="search-bar" style={{width:'280px'}}>
            <span><Search size={16} /></span>
            <input placeholder="Search by name or email..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
        </div>
        <div className="table-wrapper">
          {loading ? <div className="loading-spinner"><div className="spinner"/></div> : (
            <table>
              <thead><tr><th>#</th><th>Name</th><th>Contact</th><th>Gender</th><th>Blood Type</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.length ? filtered.map((p,i) => (
                  <tr key={p.id}>
                    <td style={{color:'var(--gray-400)',fontSize:'12px'}}>{i+1}</td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                        <div style={{width:'34px',height:'34px',borderRadius:'50%',background:'var(--primary-pale)',color:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'700',fontSize:'13px',flexShrink:0}}>{p.name?.charAt(0)}</div>
                        <div><strong>{p.name}</strong><br/><small style={{color:'var(--gray-400)'}}>{p.email}</small></div>
                      </div>
                    </td>
                    <td>{p.phone || '—'}</td>
                    <td>{p.gender || '—'}</td>
                    <td>{p.blood_type ? <span className="badge badge-confirmed">{p.blood_type}</span> : '—'}</td>
                    <td>
                      <div style={{display:'flex',gap:'6px'}}>
                        <button className="btn btn-sm btn-secondary" onClick={() => deactivate(p.id)} style={{display:'flex',alignItems:'center',gap:'4px'}}><UserX size={12}/> Deactivate</button>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan="6"><div className="empty-state"><Users size={48} style={{opacity:0.3}} /><p>No patients found</p></div></td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Register New Patient</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={16}/></button>
            </div>
            <form onSubmit={submit}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={form.name} onChange={e=>set('name',e.target.value)} required /></div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" value={form.email} onChange={e=>set('email',e.target.value)} required /></div>
                  <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e=>set('phone',e.target.value)} /></div>
                </div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Date of Birth</label><input className="form-input" type="date" value={form.date_of_birth} onChange={e=>set('date_of_birth',e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Gender</label>
                    <select className="form-select" value={form.gender} onChange={e=>set('gender',e.target.value)}>
                      <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Blood Type</label>
                    <select className="form-select" value={form.blood_type} onChange={e=>set('blood_type',e.target.value)}>
                      <option value="">Select</option>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b=><option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Emergency Contact</label><input className="form-input" value={form.emergency_contact} onChange={e=>set('emergency_contact',e.target.value)} /></div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Register Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
