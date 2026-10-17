import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Building2, FileText, Map, MessageSquareText } from 'lucide-react'
import { readAdminCollection } from '../data/admin-api.js'

export const Route = createFileRoute('/dashboard/')({ component: DashboardHome })

function DashboardHome() {
  const [counts, setCounts] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    Promise.all(['properties', 'files', 'maps', 'queries'].map(readAdminCollection))
      .then((results) => { if (active) setCounts(results.map((item) => item.count)) })
      .catch((caught) => { if (active) setError(caught.message) })
    return () => { active = false }
  }, [])

  const cards = [
    ['Properties', counts?.[0], '/dashboard/properties', Building2], ['Files', counts?.[1], '/dashboard/files', FileText],
    ['Maps', counts?.[2], '/dashboard/maps', Map], ['Synthetic Queries', counts?.[3], '/dashboard/queries', MessageSquareText],
  ]
  return <section>
    <p className="admin-eyebrow">SYNTHETIC WORKSPACE</p><h1 className="admin-page-title">Dashboard overview</h1>
    <p className="admin-muted">A local-only view of seeded staging content. No production records or external notifications are connected.</p>
    {error && <p className="admin-error" role="alert">{error}</p>}
    <div className="admin-stat-grid">{cards.map(([title, count, href, Icon]) => <Link className="admin-stat-card" to={href} key={title}><span><Icon aria-hidden="true" /></span><strong>{count ?? '—'}</strong><small>{title}</small></Link>)}</div>
    <div className="admin-notice"><strong>Persistence boundary</strong><p>Admin changes use a separate in-memory synthetic repository. They disappear when the local API restarts and do not yet update the public directory fixtures. No database binding or object storage is configured.</p></div>
  </section>
}
