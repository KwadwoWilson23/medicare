import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { ClipboardList, Activity } from 'lucide-react'

export default function PatientRecords() {
  const { roleData } = useAuth()
  const [records, setRecords] = useState([])
  const [vitals, setVitals] = useState([])

  useEffect(() => {
    if (!roleData?.id) return
    api.get(`/records?patient_id=${roleData.id}`).then(r => setRecords(r.data))
    api.get(`/records/vitals/${roleData.id}`).then(r => setVitals(r.data))
  }, [roleData])

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h2 style={{display:'flex',alignItems:'center',gap:'8px'}}><ClipboardList size={22}/> My Records</h2>
          <p>Your complete medical history</p>
        </div>
      </div>

      <div className="grid-2">
        <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
          <h3 style={{fontSize:'16px',color:'var(--gray-800)'}}>Diagnoses & Prescriptions</h3>
          {records.length ? records.map(r => (
            <div className="card" key={r.id}>
              <div className="card-header">
                <div><h3 style={{fontSize:'15px'}}>{new Date(r.created_at).toLocaleDateString()}</h3></div>
                <span className="badge badge-confirmed">Dr. {r.doctor_name}</span>
              </div>
              <div className="card-body">
                {r.diagnosis && <div><p style={{fontSize:'12px',color:'var(--gray-500)',fontWeight:'600'}}>DIAGNOSIS</p><p style={{fontSize:'14px',marginBottom:'12px'}}>{r.diagnosis}</p></div>}
                {r.treatment && <div><p style={{fontSize:'12px',color:'var(--gray-500)',fontWeight:'600'}}>TREATMENT</p><p style={{fontSize:'14px',marginBottom:'12px'}}>{r.treatment}</p></div>}
                {r.prescription && <div><p style={{fontSize:'12px',color:'var(--gray-500)',fontWeight:'600'}}>PRESCRIPTION</p><p style={{fontSize:'14px',marginBottom:'12px'}}>{r.prescription}</p></div>}
                {r.lab_results && <div><p style={{fontSize:'12px',color:'var(--gray-500)',fontWeight:'600'}}>LAB RESULTS</p><p style={{fontSize:'14px'}}>{r.lab_results}</p></div>}
              </div>
            </div>
          )) : <div className="empty-state"><ClipboardList size={48} style={{opacity:0.3}}/><p>No medical records</p></div>}
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
          <h3 style={{fontSize:'16px',color:'var(--gray-800)'}}>Recent Vitals</h3>
          {vitals.length ? vitals.map(v => (
            <div className="card" key={v.id}>
              <div className="card-body">
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'12px',borderBottom:'1px solid var(--gray-100)',paddingBottom:'8px'}}>
                  <strong style={{color:'var(--primary)'}}>{new Date(v.recorded_at).toLocaleString()}</strong>
                  <span style={{fontSize:'12px',color:'var(--gray-500)'}}>Recorded by {v.nurse_name}</span>
                </div>
                <div className="grid-2">
                  <div><span style={{fontSize:'12px',color:'var(--gray-500)'}}>Blood Pressure</span><br/><strong>{v.blood_pressure||'—'}</strong></div>
                  <div><span style={{fontSize:'12px',color:'var(--gray-500)'}}>Heart Rate</span><br/><strong>{v.heart_rate?`${v.heart_rate} bpm`:'—'}</strong></div>
                  <div><span style={{fontSize:'12px',color:'var(--gray-500)'}}>Temperature</span><br/><strong>{v.temperature?`${v.temperature}°C`:'—'}</strong></div>
                  <div><span style={{fontSize:'12px',color:'var(--gray-500)'}}>O2 Saturation</span><br/><strong>{v.oxygen_saturation?`${v.oxygen_saturation}%`:'—'}</strong></div>
                </div>
              </div>
            </div>
          )) : <div className="empty-state"><Activity size={48} style={{opacity:0.3}}/><p>No vitals recorded</p></div>}
        </div>
      </div>
    </DashboardLayout>
  )
}
