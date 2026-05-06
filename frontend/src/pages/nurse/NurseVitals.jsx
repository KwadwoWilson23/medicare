import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { Activity, User, X } from 'lucide-react'

export default function NurseVitals() {
  const { roleData } = useAuth()
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState('')
  const [vitals, setVitals] = useState([])
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({ blood_pressure:'', heart_rate:'', temperature:'', oxygen_saturation:'', weight:'', height:'' })

  useEffect(() => { api.get('/patients').then(r => setPatients(r.data)) }, [])

  useEffect(() => {
    if (selectedPatient) {
      api.get(`/records/vitals/${selectedPatient}`).then(r => setVitals(r.data))
    } else {
      setVitals([])
    }
  }, [selectedPatient])

  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const submit = async (e) => {
    e.preventDefault()
    if (!selectedPatient) return setMsg('error:Please select a patient first')
    try {
      await api.post('/records/vitals', { ...form, patient_id: selectedPatient, nurse_id: roleData.id })
      setMsg('Vitals recorded successfully!')
      setForm({ blood_pressure:'', heart_rate:'', temperature:'', oxygen_saturation:'', weight:'', height:'' })
      api.get(`/records/vitals/${selectedPatient}`).then(r => setVitals(r.data))
    } catch(err) { setMsg('error:' + (err.response?.data?.error || 'Error')) }
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h2 style={{display:'flex',alignItems:'center',gap:'8px'}}><Activity size={22}/> Record Vitals</h2>
          <p>Log patient vital signs</p>
        </div>
      </div>

      {msg && <div className={`alert ${msg.startsWith('error:')?'alert-error':'alert-success'}`}>{msg.replace('error:','')}<button style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer'}} onClick={()=>setMsg('')}><X size={14}/></button></div>}

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><h3>New Vitals Entry</h3></div>
          <form onSubmit={submit} className="card-body">
            <div className="form-group"><label className="form-label">Select Patient *</label>
              <select className="form-select" value={selectedPatient} onChange={e=>setSelectedPatient(e.target.value)} required>
                <option value="">Choose patient...</option>
                {patients.map(p=><option key={p.id} value={p.id}>{p.name} ({p.gender}, {p.blood_type})</option>)}
              </select>
            </div>
            {selectedPatient && (
              <>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Blood Pressure (mmHg)</label><input className="form-input" placeholder="120/80" value={form.blood_pressure} onChange={e=>set('blood_pressure',e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Heart Rate (bpm)</label><input className="form-input" type="number" placeholder="72" value={form.heart_rate} onChange={e=>set('heart_rate',e.target.value)} /></div>
                </div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Temperature (°C)</label><input className="form-input" type="number" step="0.1" placeholder="37.0" value={form.temperature} onChange={e=>set('temperature',e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">O2 Saturation (%)</label><input className="form-input" type="number" placeholder="98" value={form.oxygen_saturation} onChange={e=>set('oxygen_saturation',e.target.value)} /></div>
                </div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Weight (kg)</label><input className="form-input" type="number" step="0.1" placeholder="70.5" value={form.weight} onChange={e=>set('weight',e.target.value)} /></div>
                  <div className="form-group"><label className="form-label">Height (cm)</label><input className="form-input" type="number" placeholder="175" value={form.height} onChange={e=>set('height',e.target.value)} /></div>
                </div>
                <button type="submit" className="btn btn-primary" style={{width:'100%',justifyContent:'center',marginTop:'10px'}}>Save Vitals</button>
              </>
            )}
          </form>
        </div>

        <div className="card">
          <div className="card-header"><h3>Recent Vitals History</h3></div>
          <div className="card-body" style={{padding:'0'}}>
            {selectedPatient ? (
              <div style={{maxHeight:'500px',overflowY:'auto',padding:'20px',display:'flex',flexDirection:'column',gap:'16px'}}>
                {vitals.length ? vitals.map(v => (
                  <div key={v.id} style={{border:'1px solid var(--gray-200)',borderRadius:'12px',padding:'16px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:'12px',borderBottom:'1px solid var(--gray-100)',paddingBottom:'8px'}}>
                      <strong style={{color:'var(--primary)'}}>{new Date(v.recorded_at).toLocaleString()}</strong>
                      <span style={{fontSize:'12px',color:'var(--gray-500)'}}>By {v.nurse_name}</span>
                    </div>
                    <div className="grid-2" style={{gap:'8px'}}>
                      <div><span style={{fontSize:'12px',color:'var(--gray-500)'}}>BP:</span> <strong>{v.blood_pressure||'—'}</strong></div>
                      <div><span style={{fontSize:'12px',color:'var(--gray-500)'}}>HR:</span> <strong>{v.heart_rate?`${v.heart_rate} bpm`:'—'}</strong></div>
                      <div><span style={{fontSize:'12px',color:'var(--gray-500)'}}>Temp:</span> <strong>{v.temperature?`${v.temperature}°C`:'—'}</strong></div>
                      <div><span style={{fontSize:'12px',color:'var(--gray-500)'}}>SpO2:</span> <strong>{v.oxygen_saturation?`${v.oxygen_saturation}%`:'—'}</strong></div>
                    </div>
                  </div>
                )) : <div className="empty-state"><Activity size={48} style={{opacity:0.3}}/><p>No vitals recorded yet</p></div>}
              </div>
            ) : (
              <div className="empty-state" style={{padding:'40px'}}><User size={48} style={{opacity:0.3}}/><p>Select a patient to view history</p></div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
