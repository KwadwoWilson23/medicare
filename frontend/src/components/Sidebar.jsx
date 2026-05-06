import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Users, Stethoscope, UserCog, CalendarDays,
  CreditCard, Building2, ClipboardList, HeartPulse, Activity,
  UserPlus, LogOut, Hospital
} from 'lucide-react'

const NAV = {
  admin: [
    { section: 'Overview', items: [{ to: '/admin', icon: LayoutDashboard, label: 'Dashboard' }] },
    { section: 'Management', items: [
      { to: '/admin/patients', icon: Users, label: 'Patients' },
      { to: '/admin/doctors', icon: Stethoscope, label: 'Doctors' },
      { to: '/admin/staff', icon: UserCog, label: 'Staff' },
      { to: '/admin/appointments', icon: CalendarDays, label: 'Appointments' },
    ]},
    { section: 'Finance', items: [
      { to: '/admin/billing', icon: CreditCard, label: 'Billing' },
      { to: '/admin/wards', icon: Building2, label: 'Wards' },
    ]},
  ],
  doctor: [
    { section: 'Overview', items: [{ to: '/doctor', icon: LayoutDashboard, label: 'Dashboard' }] },
    { section: 'Clinical', items: [
      { to: '/doctor/appointments', icon: CalendarDays, label: 'My Appointments' },
      { to: '/doctor/patients', icon: Users, label: 'My Patients' },
      { to: '/doctor/records', icon: ClipboardList, label: 'Medical Records' },
    ]},
  ],
  patient: [
    { section: 'Overview', items: [{ to: '/patient', icon: LayoutDashboard, label: 'Dashboard' }] },
    { section: 'My Health', items: [
      { to: '/patient/appointments', icon: CalendarDays, label: 'Appointments' },
      { to: '/patient/records', icon: ClipboardList, label: 'My Records' },
      { to: '/patient/billing', icon: CreditCard, label: 'Billing' },
    ]},
  ],
  nurse: [
    { section: 'Overview', items: [{ to: '/nurse', icon: LayoutDashboard, label: 'Dashboard' }] },
    { section: 'Clinical', items: [
      { to: '/nurse/patients', icon: Users, label: 'Patients' },
      { to: '/nurse/vitals', icon: Activity, label: 'Record Vitals' },
      { to: '/nurse/wards', icon: Building2, label: 'Ward Overview' },
    ]},
  ],
  receptionist: [
    { section: 'Overview', items: [{ to: '/receptionist', icon: LayoutDashboard, label: 'Dashboard' }] },
    { section: 'Front Desk', items: [
      { to: '/receptionist/patients', icon: UserPlus, label: 'Register Patient' },
      { to: '/receptionist/appointments', icon: CalendarDays, label: 'Appointments' },
      { to: '/receptionist/billing', icon: CreditCard, label: 'Billing' },
    ]},
  ],
}

const ROLE_LABELS = { admin: 'Administrator', doctor: 'Doctor', patient: 'Patient', nurse: 'Nurse', receptionist: 'Receptionist' }

export default function Sidebar() {
  const { user, logout } = useAuth()
  if (!user) return null
  const nav = NAV[user.role] || []

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon"><Hospital size={22} color="var(--primary)" /></div>
        <div>
          <h1>MediCare</h1>
          <span>HMS Platform</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {nav.map(section => (
          <div className="nav-section" key={section.section}>
            <div className="nav-section-label">{section.section}</div>
            {section.items.map(item => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to.split('/').length <= 2}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                >
                  <span className="nav-icon"><Icon size={18} /></span>
                  {item.label}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <strong>{user.name}</strong>
            <span>{ROLE_LABELS[user.role]}</span>
          </div>
        </div>
        <button className="logout-btn" style={{width:'100%',marginTop:'10px',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}} onClick={logout}><LogOut size={14} /> Sign Out</button>
      </div>
    </div>
  )
}
