import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import { CreditCard, DollarSign, CheckCircle, Clock, AlertTriangle, Banknote } from 'lucide-react'

const STATUS_MAP = { Pending:'badge-pending', Paid:'badge-paid', Overdue:'badge-overdue', Cancelled:'badge-cancelled' }

export default function AdminBilling() {
  const [bills, setBills] = useState([])
  const [stats, setStats] = useState(null)
  const [filter, setFilter] = useState('')

  const load = () => {
    const params = filter ? `?status=${filter}` : ''
    api.get(`/billing${params}`).then(r => setBills(r.data))
    api.get('/billing/stats/summary').then(r => setStats(r.data))
  }
  useEffect(() => { load() }, [filter])

  const pay = async (id) => {
    const method = prompt('Payment method? (Cash / Card / Insurance)', 'Cash')
    if (!method) return
    await api.patch(`/billing/${id}/pay`, { payment_method: method }); load()
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h2 style={{display:'flex',alignItems:'center',gap:'8px'}}><CreditCard size={22}/> Billing</h2>
          <p>Financial records & payment management</p>
        </div>
      </div>

      {stats && (
        <div className="stats-grid" style={{marginBottom:'24px'}}>
          {[
            { label:'Total Billed', value:`$${stats.total?.toLocaleString()}`, icon: DollarSign, color:'blue' },
            { label:'Collected', value:`$${stats.paid?.toLocaleString()}`, icon: CheckCircle, color:'green' },
            { label:'Pending', value:`$${stats.pending?.toLocaleString()}`, icon: Clock, color:'orange' },
            { label:'Overdue', value:`$${stats.overdue?.toLocaleString()}`, icon: AlertTriangle, color:'red' },
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
      )}

      <div className="card">
        <div className="card-header">
          <h3>Bills ({bills.length})</h3>
          <select className="form-select" style={{width:'160px'}} value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="">All</option>
            {['Pending','Paid','Overdue','Cancelled'].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Patient</th><th>Description</th><th>Amount</th><th>Issued</th><th>Due Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {bills.map(b => (
                <tr key={b.id}>
                  <td><strong>{b.patient_name}</strong><br/><small style={{color:'var(--gray-400)'}}>{b.patient_email}</small></td>
                  <td>{b.description}</td>
                  <td style={{fontWeight:'700',color:'var(--primary)'}}>$ {b.amount?.toFixed(2)}</td>
                  <td>{b.issued_date}</td>
                  <td>{b.due_date || '—'}</td>
                  <td><span className={`badge ${STATUS_MAP[b.status]}`}>{b.status}</span></td>
                  <td>
                    {b.status === 'Pending' && (
                      <button className="btn btn-sm btn-success" onClick={()=>pay(b.id)} style={{display:'flex',alignItems:'center',gap:'4px'}}><Banknote size={12}/> Mark Paid</button>
                    )}
                    {b.status === 'Paid' && <small style={{color:'var(--gray-400)'}}>via {b.payment_method}</small>}
                  </td>
                </tr>
              ))}
              {!bills.length && <tr><td colSpan="7"><div className="empty-state"><CreditCard size={48} style={{opacity:0.3}}/><p>No billing records</p></div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
