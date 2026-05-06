import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import { Users, Stethoscope, Pill, CalendarDays, DollarSign, Building2, Clock, CalendarCheck } from 'lucide-react'

function StatCard({ icon: Icon, color, label, value, sub }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}><Icon size={26} /></div>
      <div className="stat-info">
        <h3>{value ?? '—'}</h3>
        <p>{label}</p>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  )
}

const STATUS_MAP = { Pending: 'badge-pending', Confirmed: 'badge-confirmed', Completed: 'badge-completed', Cancelled: 'badge-cancelled' }

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats').then(r => { setStats(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <DashboardLayout><div className="loading-spinner"><div className="spinner"/><p>Loading dashboard...</p></div></DashboardLayout>

  const occupancyPct = stats?.wards ? Math.round((stats.wards.occupied_beds / stats.wards.total_beds) * 100) : 0

  return (
    <DashboardLayout>
      {/* KPI Cards */}
      <div className="stats-grid">
        <StatCard icon={Users} color="blue" label="Total Patients" value={stats?.patients} sub="Active patients" />
        <StatCard icon={Stethoscope} color="green" label="Doctors" value={stats?.doctors} sub="On staff" />
        <StatCard icon={Pill} color="cyan" label="Nurses" value={stats?.nurses} sub="Active nurses" />
        <StatCard icon={CalendarDays} color="orange" label="Today's Appointments" value={stats?.appointments?.today} sub={`${stats?.appointments?.pending} pending`} />
        <StatCard icon={DollarSign} color="green" label="Total Revenue" value={`$${(stats?.revenue?.total || 0).toLocaleString()}`} sub="Collected" />
        <StatCard icon={Building2} color="blue" label="Bed Occupancy" value={`${occupancyPct}%`} sub={`${stats?.wards?.occupied_beds}/${stats?.wards?.total_beds} beds`} />
      </div>

      <div className="grid-2">
        {/* Recent Appointments */}
        <div className="card">
          <div className="card-header">
            <h3 style={{display:'flex',alignItems:'center',gap:'8px'}}><CalendarDays size={18} /> Recent Appointments</h3>
            <a href="/admin/appointments" className="btn btn-sm btn-secondary">View All</a>
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {stats?.recentAppointments?.length ? stats.recentAppointments.map(a => (
                  <tr key={a.id}>
                    <td><strong>{a.patient_name}</strong></td>
                    <td>{a.doctor_name}<br/><small style={{color:'var(--gray-400)'}}>{a.specialization}</small></td>
                    <td>{a.appointment_date}<br/><small style={{color:'var(--gray-400)'}}>{a.appointment_time}</small></td>
                    <td><span className={`badge ${STATUS_MAP[a.status]}`}>{a.status}</span></td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="empty-state"><p>No recent appointments</p></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="card">
          <div className="card-header"><h3 style={{display:'flex',alignItems:'center',gap:'8px'}}><DollarSign size={18} /> Revenue Overview</h3></div>
          <div className="card-body">
            {[
              { label: 'Total Billed', amount: stats?.revenue?.total, color: 'var(--primary)', pct: 100 },
              { label: 'Collected', amount: stats?.revenue?.paid, color: 'var(--success)', pct: stats?.revenue?.total ? Math.round((stats.revenue.paid/stats.revenue.total)*100) : 0 },
              { label: 'Outstanding', amount: stats?.revenue?.pending, color: 'var(--warning)', pct: stats?.revenue?.total ? Math.round((stats.revenue.pending/stats.revenue.total)*100) : 0 },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: '20px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                  <span style={{ fontSize:'14px', fontWeight:'600', color:'var(--gray-700)' }}>{item.label}</span>
                  <span style={{ fontSize:'14px', fontWeight:'700', color: item.color }}>${(item.amount||0).toLocaleString()}</span>
                </div>
                <div style={{ height:'8px', background:'var(--gray-100)', borderRadius:'4px', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${item.pct}%`, background: item.color, borderRadius:'4px', transition:'width 0.8s ease' }}/>
                </div>
                <div style={{ fontSize:'12px', color:'var(--gray-400)', marginTop:'4px' }}>{item.pct}% of total</div>
              </div>
            ))}

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginTop:'8px' }}>
              <div style={{ background:'var(--success-light)', borderRadius:'10px', padding:'14px', textAlign:'center' }}>
                <div style={{ fontSize:'20px', fontWeight:'800', color:'var(--success)' }}>{stats?.appointments?.total}</div>
                <div style={{ fontSize:'12px', color:'var(--success)', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' }}><CalendarCheck size={14} /> Total Appointments</div>
              </div>
              <div style={{ background:'var(--primary-pale)', borderRadius:'10px', padding:'14px', textAlign:'center' }}>
                <div style={{ fontSize:'20px', fontWeight:'800', color:'var(--primary)' }}>{stats?.appointments?.pending}</div>
                <div style={{ fontSize:'12px', color:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' }}><Clock size={14} /> Pending Review</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
