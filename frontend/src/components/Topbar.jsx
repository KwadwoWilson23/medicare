import { useAuth } from '../context/AuthContext'
import { useLocation } from 'react-router-dom'
import { Bell, LogOut } from 'lucide-react'

const PAGE_TITLES = {
  '/admin': ['Dashboard', 'Welcome back! Here\'s your hospital overview.'],
  '/admin/patients': ['Patients', 'Manage all registered patients'],
  '/admin/doctors': ['Doctors', 'Manage medical staff & specialists'],
  '/admin/staff': ['Staff', 'All hospital staff members'],
  '/admin/appointments': ['Appointments', 'View & manage all appointments'],
  '/admin/billing': ['Billing', 'Financial overview & payments'],
  '/admin/wards': ['Wards', 'Ward capacity & occupancy'],
  '/doctor': ['My Dashboard', 'Your schedule & patient overview'],
  '/doctor/appointments': ['My Appointments', 'Today\'s schedule & upcoming'],
  '/doctor/patients': ['My Patients', 'Patient list & medical history'],
  '/doctor/records': ['Medical Records', 'Diagnoses & prescriptions'],
  '/patient': ['My Health', 'Your health summary & upcoming appointments'],
  '/patient/appointments': ['My Appointments', 'Book & manage appointments'],
  '/patient/records': ['My Records', 'Medical history & diagnoses'],
  '/patient/billing': ['My Bills', 'Payment history & pending bills'],
  '/nurse': ['Nurse Dashboard', 'Ward overview & patient vitals'],
  '/nurse/patients': ['Patients', 'Patients in your care'],
  '/nurse/vitals': ['Record Vitals', 'Log patient vital signs'],
  '/nurse/wards': ['Ward Overview', 'Bed availability & assignments'],
  '/receptionist': ['Front Desk', 'Check-ins & daily operations'],
  '/receptionist/patients': ['Register Patient', 'New patient registration'],
  '/receptionist/appointments': ['Appointments', 'Walk-in & scheduled visits'],
  '/receptionist/billing': ['Billing', 'Collect payments & invoices'],
}

export default function Topbar() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const [title, subtitle] = PAGE_TITLES[pathname] || ['HMS', 'Hospital Management System']

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="topbar">
      <div className="topbar-left">
        <h2>{title}</h2>
        <p>{subtitle} &mdash; {dateStr}</p>
      </div>
      <div className="topbar-right">
        <div className="topbar-badge" title="Notifications">
          <Bell size={18} />
          <div className="badge-dot"></div>
        </div>
        <div className="topbar-user">
          <div className="t-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <span>{user?.name?.split(' ')[0]}</span>
        </div>
        <button className="logout-btn" onClick={logout} style={{display:'flex',alignItems:'center',gap:'6px'}}><LogOut size={14} /> Sign Out</button>
      </div>
    </div>
  )
}
