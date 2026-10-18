import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import {
  ArrowUpCircle, BarChart3, Building2, Calculator, ChevronRight, FileText, Home, Layers, LayoutDashboard,
  LayoutGrid, LogOut, Mail, Map, Milestone, MoreVertical, Percent, Receipt, UserCircle, Users,
} from 'lucide-react'
import { readAdminCollection, logoutAdmin } from '../../data/admin-api.js'

const mainNavItems = [
  ['Dashboard', '/dashboard', LayoutDashboard], ['Properties', '/dashboard/properties', Home], ['Maps', '/dashboard/maps', Map],
  ['Files', '/dashboard/files', FileText], ['Cities', '/dashboard/cities', Building2], ['Categories', '/dashboard/categories', LayoutGrid],
  ['Phases', '/dashboard/phases', Milestone], ['Societies', '/dashboard/societies', Users],
]
const calculatorNavItems = [
  ['Calculator Phases', '/dashboard/calculator-phases', Calculator], ['Calculator Blocks', '/dashboard/calculator-blocks', Layers],
  ['Calculator Property Types', '/dashboard/calculator-property-types', Building2], ['Calculator Rates', '/dashboard/calculator-rates', BarChart3],
  ['Calculator Transfer Fees', '/dashboard/calculator-transfer-fees', ArrowUpCircle], ['Calculator Fees', '/dashboard/calculator-fees', Receipt],
  ['Calculator Tax Rates', '/dashboard/calculator-tax-rates', Percent], ['Calculator Fee Rules', '/dashboard/calculator-fee-rules', Receipt],
]
const secondaryNavItems = [['Landing Page', '/dashboard/landing-page', LayoutDashboard], ['Queries', '/dashboard/queries', Mail], ['Users', '/dashboard/users', Users]]

export function StagingAppSidebar({ user, mobileOpen, desktopOpen, onNavigate }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [calculatorOpen, setCalculatorOpen] = useState(location.pathname.includes('/dashboard/calculator-'))
  const [unreadCount, setUnreadCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    let active = true
    readAdminCollection('queries').then((result) => { if (active) setUnreadCount(result.items.filter((item) => !item.isRead).length) }).catch(() => {})
    return () => { active = false }
  }, [])

  async function signOut() {
    await logoutAdmin()
    await navigate({ to: '/login' })
  }
  function renderLink([label, href, Icon], nested = false) {
    const active = location.pathname === href
    return <Link key={href} to={href} onClick={onNavigate} className={`dashboard-nav-link${active ? ' is-active' : ''}${nested ? ' is-nested' : ''}`} aria-current={active ? 'page' : undefined}>
      <Icon aria-hidden="true" size={18} strokeWidth={1.8} /><span>{label}</span>
      {label === 'Queries' && unreadCount > 0 && <span className="dashboard-nav-badge">{unreadCount}</span>}
    </Link>
  }

  return <>
    <button className={`dashboard-mobile-scrim${mobileOpen ? ' is-open' : ''}`} type="button" aria-label="Close navigation menu" onClick={onNavigate} />
    <aside className={`dashboard-sidebar${mobileOpen ? ' is-open' : ''}${desktopOpen ? ' is-desktop-open' : ''}`} aria-label="Dashboard navigation">
      <div className="dashboard-sidebar-brand"><Link to="/" onClick={onNavigate}><span className="dashboard-brand-icon"><Building2 size={20} aria-hidden="true" /></span><span>The Zalmi Marketing</span></Link></div>
      <nav className="dashboard-sidebar-nav">
        <div className="dashboard-nav-group">{mainNavItems.map((item) => renderLink(item))}</div>
        <div className="dashboard-nav-group">
          <button type="button" className={`dashboard-nav-link dashboard-nav-toggle${calculatorOpen ? ' is-expanded' : ''}`} aria-expanded={calculatorOpen} onClick={() => setCalculatorOpen((open) => !open)}>
            <Calculator aria-hidden="true" size={18} strokeWidth={1.8} /><span>Manage Calculator</span><ChevronRight className="dashboard-nav-chevron" aria-hidden="true" size={16} />
          </button>
          {calculatorOpen && <div className="dashboard-subnav">{calculatorNavItems.map((item) => renderLink(item, true))}</div>}
        </div>
        <div className="dashboard-nav-group dashboard-secondary-nav">{secondaryNavItems.map((item) => renderLink(item))}</div>
      </nav>
      <div className="dashboard-user-area">
        <button type="button" className="dashboard-user-trigger" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          <span className="dashboard-avatar" aria-hidden="true">{(user?.name || 'Admin').split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span>
          <span className="dashboard-user-copy"><strong>{user?.name || 'Admin'}</strong><small>{user?.email || 'Admin'}</small></span><MoreVertical aria-hidden="true" size={17} />
        </button>
        {menuOpen && <div className="dashboard-user-menu"><Link to="/dashboard/profile" onClick={() => { setMenuOpen(false); onNavigate?.() }}><UserCircle aria-hidden="true" size={16} />Account</Link><button type="button" onClick={signOut}><LogOut aria-hidden="true" size={16} />Log out</button></div>}
      </div>
    </aside>
  </>
}
