import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { CreditCard, Clock, CheckCircle } from 'lucide-react'

const STATUS_MAP = { Pending:'badge-pending', Paid:'badge-paid', Overdue:'badge-overdue', Cancelled:'badge-cancelled' }

export default function PatientBilling() {
  const { roleData } = useAuth()
  const [bills, setBills] = useState([])

  useEffect(() => {
    if (!roleData?.id) return
    api.get(`/billing?patient_id=${roleData.id}`).then(r => setBills(r.data))
  }, [roleData])

  const pending = bills.filter(b => b.status === 'Pending' || b.status === 'Overdue')
  const totalPending = pending.reduce((sum, b) => sum + b.amount, 0)

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h2 style={{display:'flex',alignItems:'center',gap:'8px'}}><CreditCard size={22}/> My Bills</h2>
          <p>Invoices & payment history</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{borderColor: totalPending > 0 ? 'var(--warning)' : 'var(--gray-200)'}}>
          <div className={`stat-icon ${totalPending > 0 ? 'orange' : 'green'}`}>{totalPending > 0 ? <Clock size={26}/> : <CheckCircle size={26}/>}</div>
          <div className="stat-info">
            <h3 style={{color: totalPending > 0 ? 'var(--warning)' : 'var(--success)'}}>${totalPending.toFixed(2)}</h3>
            <p>Outstanding Balance</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3>Billing History</h3></div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Description</th><th>Issued</th><th>Due Date</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {bills.map(b => (
                <tr key={b.id}>
                  <td><strong>{b.description}</strong></td>
                  <td>{b.issued_date}</td>
                  <td>{b.due_date||'—'}</td>
                  <td><strong style={{color:'var(--primary)'}}>${b.amount.toFixed(2)}</strong></td>
                  <td><span className={`badge ${STATUS_MAP[b.status]}`}>{b.status}</span></td>
                </tr>
              ))}
              {!bills.length && <tr><td colSpan="5"><div className="empty-state"><CreditCard size={48} style={{opacity:0.3}}/><p>No billing records</p></div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
