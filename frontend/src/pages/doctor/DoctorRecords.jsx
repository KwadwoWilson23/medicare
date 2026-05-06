import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { ClipboardList, FilePlus, X } from 'lucide-react'

export default function DoctorRecords() {
  const { roleData } = useAuth()
  const [records, setRecords] = useState([])
  const [patients, setPatients] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({ patient_id:'', diagnosis:'', treatment:'', prescription:'', lab_results:'' })

  const load = () => {
    if (!roleData?.id) return
    api.get(`/records?doctor_id=${roleData.id}`).then(r => setRecords(r.data))
  }
  useEffect(() => { load(); api.get('/patients').then(r=>setPatients(r.data)) }, [roleData])

  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const submit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/records', { ...form, doctor_id: roleData.id })
      setMsg('Record saved!'); setShowModal(false)
      setForm({ patient_id:'', diagnosis:'', treatment:'', prescription:'', lab_results:'' })
      load()
    } catch(err) { setMsg('error:' + (err.response?.data?.error || 'Error')) }
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h2 style={{display:'flex',alignItems:'center',gap:'8px'}}><ClipboardList size={22}/> Medical Records</h2>
          <p>Diagnoses, treatments & prescriptions</p>
        </div>
        <button className="btn btn-primary" onClick={()=>setShowModal(true)} style={{display:'flex',alignItems:'center',gap:'6px'}}><FilePlus size={16}/> New Record</button>
      </div>

      {msg && <div className={`alert ${msg.startsWith('error:')?'alert-error':'alert-success'}`}>{msg.replace('error:','')}<button style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer'}} onClick={()=>setMsg('')}><X size={14}/></button></div>}

      <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
        {records.length ? records.map(r=>(
          <div className="card" key={r.id}>
            <div className="card-header">
              <div>
                <h3 style={{fontSize:'15px'}}>{r.patient_name}</h3>
                <p style={{fontSize:'12px',color:'var(--gray-400)'}}>{new Date(r.created_at).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</p>
              </div>
              <span className="badge badge-confirmed">{r.specialization}</span>
            </div>
            <div className="card-body">
              <div className="grid-2" style={{gap:'16px'}}>
                {r.diagnosis&&<div><p style={{fontSize:'12px',color:'var(--gray-500)',fontWeight:'600',marginBottom:'4px'}}>DIAGNOSIS</p><p style={{fontSize:'14px'}}>{r.diagnosis}</p></div>}
                {r.treatment&&<div><p style={{fontSize:'12px',color:'var(--gray-500)',fontWeight:'600',marginBottom:'4px'}}>TREATMENT</p><p style={{fontSize:'14px'}}>{r.treatment}</p></div>}
                {r.prescription&&<div><p style={{fontSize:'12px',color:'var(--gray-500)',fontWeight:'600',marginBottom:'4px'}}>PRESCRIPTION</p><p style={{fontSize:'14px'}}>{r.prescription}</p></div>}
                {r.lab_results&&<div><p style={{fontSize:'12px',color:'var(--gray-500)',fontWeight:'600',marginBottom:'4px'}}>LAB RESULTS</p><p style={{fontSize:'14px'}}>{r.lab_results}</p></div>}
              </div>
            </div>
          </div>
        )):<div className="empty-state"><ClipboardList size={48} style={{opacity:0.3}}/><p>No medical records yet</p></div>}
      </div>

      {showModal&&(
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className="modal modal-lg">
            <div className="modal-header"><h3>Create Medical Record</h3><button className="modal-close" onClick={()=>setShowModal(false)}><X size={16}/></button></div>
            <form onSubmit={submit}>
              <div className="modal-body">
                <div className="form-group"><label className="form-label">Patient *</label>
                  <select className="form-select" value={form.patient_id} onChange={e=>set('patient_id',e.target.value)} required>
                    <option value="">Select patient...</option>
                    {patients.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Diagnosis</label><textarea className="form-textarea" value={form.diagnosis} onChange={e=>set('diagnosis',e.target.value)} placeholder="Diagnosis details..."/></div>
                  <div className="form-group"><label className="form-label">Treatment</label><textarea className="form-textarea" value={form.treatment} onChange={e=>set('treatment',e.target.value)} placeholder="Treatment plan..."/></div>
                </div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Prescription</label><textarea className="form-textarea" value={form.prescription} onChange={e=>set('prescription',e.target.value)} placeholder="Medications prescribed..."/></div>
                  <div className="form-group"><label className="form-label">Lab Results</label><textarea className="form-textarea" value={form.lab_results} onChange={e=>set('lab_results',e.target.value)} placeholder="Lab results summary..."/></div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
