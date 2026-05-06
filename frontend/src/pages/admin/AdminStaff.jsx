import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import { UserCog, Search } from 'lucide-react'

const ROLE_COLORS = { admin:'badge-admin', doctor:'badge-doctor', nurse:'badge-nurse', receptionist:'badge-receptionist' }

export default function AdminStaff() {
  const [staff, setStaff] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  useEffect(() => { api.get('/admin/staff').then(r => setStaff(r.data)) }, [])

  const filtered = staff.filter(s =>
    (roleFilter ? s.role === roleFilter : true) &&
    (s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h2 style={{display:'flex',alignItems:'center',gap:'8px'}}><UserCog size={22}/> Staff</h2>
          <p>All hospital staff members</p>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <h3>Staff Members ({filtered.length})</h3>
          <div style={{display:'flex',gap:'10px'}}>
            <select className="form-select" style={{width:'160px'}} value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}>
              <option value="">All Roles</option>
              {['admin','doctor','nurse','receptionist'].map(r=><option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
            </select>
            <div className="search-bar" style={{width:'240px'}}><span><Search size={16}/></span><input placeholder="Search staff..." value={search} onChange={e=>setSearch(e.target.value)} /></div>
          </div>
        </div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                      <div style={{width:'34px',height:'34px',borderRadius:'50%',background:'var(--primary-pale)',color:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'700',fontSize:'13px'}}>{s.name?.charAt(0)}</div>
                      <strong>{s.name}</strong>
                    </div>
                  </td>
                  <td>{s.email}</td>
                  <td>{s.phone || '—'}</td>
                  <td><span className={`badge ${ROLE_COLORS[s.role] || 'badge-confirmed'}`}>{s.role}</span></td>
                  <td>{new Date(s.created_at).toLocaleDateString()}</td>
                  <td><span className={`badge ${s.is_active ? 'badge-completed':'badge-cancelled'}`}>{s.is_active ? 'Active':'Inactive'}</span></td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan="6"><div className="empty-state"><UserCog size={48} style={{opacity:0.3}}/><p>No staff found</p></div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
