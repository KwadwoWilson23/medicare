import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { Building2, CircleDot, Users, Activity } from 'lucide-react'

export default function NurseDashboard() {
  const { user } = useAuth()
  const [wards, setWards] = useState([])
  const [patients, setPatients] = useState([])

  useEffect(() => {
    api.get('/admin/wards').then(r => setWards(r.data))
    api.get('/patients').then(r => setPatients(r.data))
  }, [])

  return (
    <DashboardLayout>
      <div style={{background:'linear-gradient(135deg,var(--info),var(--info-light))',borderRadius:'16px',padding:'28px',color:'var(--gray-900)',marginBottom:'24px'}}>
        <h2 style={{fontSize:'22px',fontWeight:'800',marginBottom:'4px',color:'var(--primary-dark)'}}>Nurse {user?.name?.split(' ')[1] || user?.name}</h2>
        <p style={{opacity:0.8,color:'var(--gray-800)'}}>Shift Overview & Ward Status</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><Building2 size={26}/></div>
          <div className="stat-info"><h3>{wards.length}</h3><p>Total Wards</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><CircleDot size={26}/></div>
          <div className="stat-info"><h3>{wards.reduce((a,w)=>a+w.occupied,0)}</h3><p>Total Patients Admitted</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Users size={26}/></div>
          <div className="stat-info"><h3>{patients.length}</h3><p>Registered Patients</p></div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 style={{display:'flex',alignItems:'center',gap:'8px'}}><Building2 size={18}/> Ward Occupancy</h3>
            <a href="/nurse/wards" className="btn btn-sm btn-secondary">View Details</a>
          </div>
          <div className="table-wrapper">
            <table>
              <tbody>
                {wards.slice(0,4).map(w => {
                  const pct = Math.round((w.occupied/w.capacity)*100)
                  return (
                    <tr key={w.id}>
                      <td><strong>{w.name}</strong><br/><small style={{color:'var(--gray-500)'}}>{w.department}</small></td>
                      <td style={{textAlign:'right'}}>
                        <span className={`badge ${pct>=90?'badge-cancelled':pct>=70?'badge-pending':'badge-completed'}`}>{w.occupied}/{w.capacity} Full</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 style={{display:'flex',alignItems:'center',gap:'8px'}}>Quick Actions</h3>
          </div>
          <div className="card-body" style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            <a href="/nurse/vitals" className="btn btn-primary" style={{justifyContent:'center',padding:'16px',fontSize:'16px',display:'flex',alignItems:'center',gap:'8px'}}><Activity size={18}/> Record Patient Vitals</a>
            <a href="/nurse/patients" className="btn btn-secondary" style={{justifyContent:'center',padding:'16px',fontSize:'16px',display:'flex',alignItems:'center',gap:'8px'}}><Users size={18}/> View Patient List</a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
