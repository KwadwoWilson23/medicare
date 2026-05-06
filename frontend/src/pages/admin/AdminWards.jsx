import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import { Building2, BedDouble, CircleDot, CheckCircle } from 'lucide-react'

export default function AdminWards() {
  const [wards, setWards] = useState([])
  useEffect(() => { api.get('/admin/wards').then(r => setWards(r.data)) }, [])

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h2 style={{display:'flex',alignItems:'center',gap:'8px'}}><Building2 size={22}/> Wards</h2>
          <p>Bed availability & ward occupancy</p>
        </div>
      </div>
      <div className="stats-grid" style={{marginBottom:'24px'}}>
        {[
          { label:'Total Beds', value: wards.reduce((a,w)=>a+w.capacity,0), icon: BedDouble, color:'blue' },
          { label:'Occupied', value: wards.reduce((a,w)=>a+w.occupied,0), icon: CircleDot, color:'red' },
          { label:'Available', value: wards.reduce((a,w)=>a+(w.capacity-w.occupied),0), icon: CheckCircle, color:'green' },
          { label:'Wards', value: wards.length, icon: Building2, color:'cyan' },
        ].map(s => {
          const Icon = s.icon
          return (
            <div className="stat-card" key={s.label}>
              <div className={`stat-icon ${s.color}`}><Icon size={26}/></div>
              <div className="stat-info"><h3>{s.value}</h3><p>{s.label}</p></div>
            </div>
          )
        })}
      </div>
      <div className="grid-2">
        {wards.map(w => {
          const pct = Math.round((w.occupied / w.capacity) * 100)
          const barColor = pct >= 90 ? 'var(--danger)' : pct >= 70 ? 'var(--warning)' : 'var(--success)'
          return (
            <div className="card" key={w.id}>
              <div className="card-header">
                <div>
                  <h3>{w.name}</h3>
                  <p style={{fontSize:'13px',color:'var(--gray-500)',marginTop:'2px'}}>{w.department} · {w.ward_type}</p>
                </div>
                <span className={`badge ${pct>=90?'badge-cancelled':pct>=70?'badge-pending':'badge-completed'}`}>{pct}% Full</span>
              </div>
              <div className="card-body">
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
                  <span style={{fontSize:'14px',color:'var(--gray-600)'}}>Occupancy</span>
                  <strong style={{color:'var(--gray-800)'}}>{w.occupied} / {w.capacity} beds</strong>
                </div>
                <div style={{height:'12px',background:'var(--gray-100)',borderRadius:'6px',overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${pct}%`,background:barColor,borderRadius:'6px',transition:'width 0.8s ease'}}/>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',marginTop:'12px'}}>
                  <span style={{fontSize:'13px',color:'var(--success)',fontWeight:'600',display:'flex',alignItems:'center',gap:'4px'}}><CheckCircle size={14}/> {w.capacity - w.occupied} Available</span>
                  <span style={{fontSize:'13px',color:'var(--danger)',fontWeight:'600',display:'flex',alignItems:'center',gap:'4px'}}><CircleDot size={14}/> {w.occupied} Occupied</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </DashboardLayout>
  )
}
