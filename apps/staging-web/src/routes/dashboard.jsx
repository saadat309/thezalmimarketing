import { useEffect, useState } from 'react'
import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router'
import { ArrowLeft, Menu, ShieldCheck, X } from 'lucide-react'
import { StagingAppSidebar } from '../components/dashboard/StagingAppSidebar.jsx'
import { readAdminSession } from '../data/admin-api.js'

const titles = {
  dashboard: 'Dashboard', properties: 'Properties', maps: 'Maps', files: 'Files', cities: 'Cities', categories: 'Categories', societies: 'Societies', phases: 'Phases',
  'landing-page': 'Landing Page', queries: 'Queries', 'calculator-phases': 'Calculator Phases', 'calculator-blocks': 'Calculator Blocks',
  'calculator-property-types': 'Calculator Property Types', 'calculator-rates': 'Calculator Rates', 'calculator-transfer-fees': 'Calculator Transfer Fees',
  'calculator-fees': 'Calculator Fees', 'calculator-tax-rates': 'Calculator Tax Rates', 'calculator-fee-rules': 'Calculator Fee Rules', users: 'Users', profile: 'Profile',
}

export const Route = createFileRoute('/dashboard')({
  head: () => ({ meta: [{ title: 'Admin Dashboard | Zalmi Marketing Staging' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  component: DashboardGuard,
})

function DashboardGuard() {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('checking')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    readAdminSession().then((account) => {
      if (!active) return
      if (!account) {
        const returnTo = `${window.location.pathname}${window.location.search}`
        window.location.replace(`/login?redirect=${encodeURIComponent(returnTo)}`)
        return
      }
      setUser(account)
      setStatus('ready')
    }).catch((caught) => {
      if (active) { setError(caught.message); setStatus('error') }
    })
    return () => { active = false }
  }, [])

  if (status === 'checking') return <main className="admin-loading" role="status">Checking local admin session…</main>
  if (status === 'error') return <main className="admin-loading"><p className="admin-error" role="alert">{error}</p><Link to="/login">Return to sign in</Link></main>
  return <DashboardFrame user={user} />
}

function DashboardFrame({ user }) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(user)
  useEffect(() => {
    const update = (event) => setCurrentUser(event.detail)
    window.addEventListener('staging-admin-profile-updated', update)
    return () => window.removeEventListener('staging-admin-profile-updated', update)
  }, [])
  const key = location.pathname.replace(/\/$/, '').split('/').at(-1) || 'dashboard'
  const title = titles[key] || 'Dashboard'
  const closeMobile = () => setMobileOpen(false)

  return <>
    <StagingAppSidebar user={currentUser} mobileOpen={mobileOpen} desktopOpen={sidebarOpen} onNavigate={closeMobile} />
    <div className={`dashboard-main${sidebarOpen ? ' is-sidebar-expanded' : ''}`}>
      <header className="dashboard-header">
        <button type="button" className="dashboard-menu-button" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen || sidebarOpen} aria-controls="dashboard-navigation" onClick={() => { if (window.matchMedia('(max-width: 767px)').matches) setMobileOpen((open) => !open); else setSidebarOpen((open) => !open) }}>
          {mobileOpen ? <X aria-hidden="true" size={18} /> : <Menu aria-hidden="true" size={18} />}
        </button>
        <span className="dashboard-header-divider" aria-hidden="true" />
        <h1>{title}</h1>
      </header>
      <main className="dashboard-content"><Outlet /></main>
      <div className="dashboard-safety-footer"><span><ShieldCheck aria-hidden="true" size={14} />Staging preview · synthetic data only</span><Link to="/"><ArrowLeft aria-hidden="true" size={14} />Public site</Link></div>
    </div>
  </>
}
