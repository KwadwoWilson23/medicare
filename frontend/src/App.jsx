import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Pages
import Login from './pages/Login'

// Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminPatients from './pages/admin/AdminPatients'
import AdminDoctors from './pages/admin/AdminDoctors'
import AdminStaff from './pages/admin/AdminStaff'
import AdminAppointments from './pages/admin/AdminAppointments'
import AdminBilling from './pages/admin/AdminBilling'
import AdminWards from './pages/admin/AdminWards'

// Doctor
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import DoctorAppointments from './pages/doctor/DoctorAppointments'
import DoctorRecords from './pages/doctor/DoctorRecords'

// Patient
import PatientDashboard from './pages/patient/PatientDashboard'
import PatientAppointments from './pages/patient/PatientAppointments'
import PatientRecords from './pages/patient/PatientRecords'
import PatientBilling from './pages/patient/PatientBilling'

// Nurse
import NurseDashboard from './pages/nurse/NurseDashboard'
import NurseVitals from './pages/nurse/NurseVitals'

// Receptionist
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard'

function ProtectedRoute({ children, role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (role && !role.includes(user.role)) return <Navigate to="/" />
  return children
}

function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  return <Navigate to={`/${user.role}`} />
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RoleRedirect />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute role={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/patients" element={<ProtectedRoute role={['admin']}><AdminPatients /></ProtectedRoute>} />
          <Route path="/admin/doctors" element={<ProtectedRoute role={['admin']}><AdminDoctors /></ProtectedRoute>} />
          <Route path="/admin/staff" element={<ProtectedRoute role={['admin']}><AdminStaff /></ProtectedRoute>} />
          <Route path="/admin/appointments" element={<ProtectedRoute role={['admin']}><AdminAppointments /></ProtectedRoute>} />
          <Route path="/admin/billing" element={<ProtectedRoute role={['admin']}><AdminBilling /></ProtectedRoute>} />
          <Route path="/admin/wards" element={<ProtectedRoute role={['admin']}><AdminWards /></ProtectedRoute>} />

          {/* Doctor Routes */}
          <Route path="/doctor" element={<ProtectedRoute role={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/appointments" element={<ProtectedRoute role={['doctor']}><DoctorAppointments /></ProtectedRoute>} />
          <Route path="/doctor/patients" element={<ProtectedRoute role={['doctor']}><AdminPatients /></ProtectedRoute>} />
          <Route path="/doctor/records" element={<ProtectedRoute role={['doctor']}><DoctorRecords /></ProtectedRoute>} />

          {/* Patient Routes */}
          <Route path="/patient" element={<ProtectedRoute role={['patient']}><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/appointments" element={<ProtectedRoute role={['patient']}><PatientAppointments /></ProtectedRoute>} />
          <Route path="/patient/records" element={<ProtectedRoute role={['patient']}><PatientRecords /></ProtectedRoute>} />
          <Route path="/patient/billing" element={<ProtectedRoute role={['patient']}><PatientBilling /></ProtectedRoute>} />

          {/* Nurse Routes */}
          <Route path="/nurse" element={<ProtectedRoute role={['nurse']}><NurseDashboard /></ProtectedRoute>} />
          <Route path="/nurse/patients" element={<ProtectedRoute role={['nurse']}><AdminPatients /></ProtectedRoute>} />
          <Route path="/nurse/vitals" element={<ProtectedRoute role={['nurse']}><NurseVitals /></ProtectedRoute>} />
          <Route path="/nurse/wards" element={<ProtectedRoute role={['nurse']}><AdminWards /></ProtectedRoute>} />

          {/* Receptionist Routes */}
          <Route path="/receptionist" element={<ProtectedRoute role={['receptionist']}><ReceptionistDashboard /></ProtectedRoute>} />
          <Route path="/receptionist/patients" element={<ProtectedRoute role={['receptionist']}><AdminPatients /></ProtectedRoute>} />
          <Route path="/receptionist/appointments" element={<ProtectedRoute role={['receptionist']}><AdminAppointments /></ProtectedRoute>} />
          <Route path="/receptionist/billing" element={<ProtectedRoute role={['receptionist']}><AdminBilling /></ProtectedRoute>} />
          
          <Route path="*" element={<RoleRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}
