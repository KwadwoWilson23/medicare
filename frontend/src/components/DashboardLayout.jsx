import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function DashboardLayout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <div className="page-content animate-in">
          {children}
        </div>
      </div>
    </div>
  )
}
