import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Hospital, Lock, AlertTriangle, Rocket, CheckCircle } from 'lucide-react'

const DEMOS = [
  { role: 'Admin', email: 'admin@hospital.com', pwd: 'admin123' },
  { role: 'Doctor', email: 'sarah@hospital.com', pwd: 'doctor123' },
  { role: 'Patient', email: 'alice@patient.com', pwd: 'patient123' },
  { role: 'Nurse', email: 'nurse@hospital.com', pwd: 'nurse123' },
  { role: 'Reception', email: 'reception@hospital.com', pwd: 'reception123' },
]

const ROLE_ROUTES = { admin: '/admin', doctor: '/doctor', patient: '/patient', nurse: '/nurse', receptionist: '/receptionist' }

export default function Login() {
  const { login, register, loading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '', gender: '', date_of_birth: '', blood_type: '' })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleLogin = async (e) => {
    e.preventDefault(); setError('')
    const res = await login(form.email, form.password)
    if (res.success) navigate(ROLE_ROUTES[res.role] || '/')
    else setError(res.error)
  }

  const handleRegister = async (e) => {
    e.preventDefault(); setError('')
    if (!form.name || !form.email || !form.password) return setError('Please fill all required fields')
    const res = await register(form)
    if (res.success) navigate('/patient')
    else setError(res.error)
  }

  const fillDemo = (email, pwd) => setForm(f => ({ ...f, email, password: pwd }))

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon"><Hospital size={48} color="var(--primary)" /></div>
          <h1>MediCare HMS</h1>
          <p>Hospital Management System</p>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => { setTab('login'); setError('') }}>Sign In</button>
          <button className={`auth-tab${tab === 'register' ? ' active' : ''}`} onClick={() => { setTab('register'); setError('') }}>Register</button>
        </div>

        {error && <div className="auth-error" style={{display:'flex',alignItems:'center',gap:'8px'}}><AlertTriangle size={16} /> {error}</div>}

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="Enter your email" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Enter your password" value={form.password} onChange={e => set('password', e.target.value)} required />
            </div>
            <button className="auth-submit" type="submit" disabled={loading} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>{loading ? 'Signing in...' : <><Lock size={16} /> Sign In</>}</button>

            <div className="demo-creds">
              <h4 style={{display:'flex',alignItems:'center',gap:'6px'}}><Rocket size={14} /> Demo Credentials</h4>
              {DEMOS.map(d => (
                <div className="demo-cred-item" key={d.role} style={{ cursor: 'pointer' }} onClick={() => fillDemo(d.email, d.pwd)}>
                  <span>{d.role}</span>
                  <span>{d.email}</span>
                </div>
              ))}
              <p style={{ fontSize: '11px', color: 'var(--gray-500)', marginTop: '8px' }}>Click any row to auto-fill — password is shown as role name + 123</p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" placeholder="John Doe" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" placeholder="+1-555-0000" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input className="form-input" type="date" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-select" value={form.gender} onChange={e => set('gender', e.target.value)}>
                  <option value="">Select...</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Blood Type</label>
              <select className="form-select" value={form.blood_type} onChange={e => set('blood_type', e.target.value)}>
                <option value="">Select...</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input className="form-input" type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required />
            </div>
            <button className="auth-submit" type="submit" disabled={loading} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>{loading ? 'Creating account...' : <><CheckCircle size={16} /> Create Patient Account</>}</button>
          </form>
        )}
      </div>
    </div>
  )
}
