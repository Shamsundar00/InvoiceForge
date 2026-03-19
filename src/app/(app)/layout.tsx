import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import Statusbar from '@/components/layout/Statusbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Topbar />
        <main className="main-content">
          {children}
        </main>
        <Statusbar />
      </div>
    </div>
  )
}
