import { useEffect, useState } from 'react'
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { ArrowLeft, LogOut, ShieldCheck } from 'lucide-react'
import { logoutAdmin, readAdminSession } from '../data/admin-api.js'

const sections = [
  ['Overview', '/dashboard'], ['Properties', '/dashboard/properties'], ['Maps', '/dashboard/maps'], ['Files', '/dashboard/files'],
  ['Cities', '/dashboard/cities'], ['Categories', '/dashboard/categories'], ['Societies', '/dashboard/societies'], ['Phases', '/dashboard/phases'],
  ['Landing Page', '/dashboard/landing-page'], ['Queries', '/dashboard/queries'], ['Calculator Phases', '/dashboard/calculator-phases'],
  ['Calculator Blocks', '/dashboard/calculator-blocks'], ['Calculator Property Types', '/dashboard/calculator-property-types'],
  ['Calculator Rates', '/dashboard/calculator-rates'], ['Calculator Transfer Fees', '/dashboard/calculator-transfer-fees'],
  ['Calculator Fees', '/dashboard/calculator-fees'], ['Calculator Tax Rates', '/dashboard/calculator-tax-rates'],
  ['Calculator Fee Rules', '/dashboard/calculator-fee-rules'], ['Users', '/dashboard/users'], ['Profile', '/dashboard/profile'],
]

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

  async function signOut() {
    try {
      await logoutAdmin()
      window.location.replace('/login')
    } catch (caught) { setError(caught.message) }
  }

  if (status === 'checking') return <main className="admin-loading" role="status">Checking local admin session…</main>
  if (status === 'error') return <main className="admin-loading"><p className="admin-error" role="alert">{error}</p><Link to="/login">Return to sign in</Link></main>

  return <div className="admin-app-shell">
    <aside className="admin-sidebar">
      <Link className="admin-brand" to="/dashboard"><span className="admin-brand-mark">ZM</span><span>Zalmi Marketing<small>STAGING ADMIN</small></span></Link>
      <nav aria-label="Admin navigation">{sections.map(([label, href]) => <Link key={href} to={href} activeProps={{ className: 'is-active' }}>{label}</Link>)}</nav>
      <Link className="admin-back-link" to="/"><ArrowLeft aria-hidden="true" size={16} /> Public staging site</Link>
    </aside>
    <div className="admin-main-column">
      <header className="admin-topbar"><div><ShieldCheck size={17} aria-hidden="true" /><span>Authenticated as <strong>{user.name}</strong> · {user.role}</span></div><button type="button" onClick={signOut}><LogOut size={16} aria-hidden="true" />Sign out</button></header>
      {error && <p className="admin-error admin-toast" role="alert">{error}</p>}
      <main className="admin-page-content"><Outlet /></main>
      <footer className="admin-footer">Local synthetic preview only. Changes are in-memory and reset when the API process restarts.</footer>
    </div>
  </div>
}
