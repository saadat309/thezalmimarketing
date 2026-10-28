import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { readAdminCollection } from '../data/admin-api.js'

export const Route = createFileRoute('/dashboard/')({
  head: () => ({ links: [{ rel: 'canonical', href: 'https://migration.local.invalid/dashboard' }] }),
  component: DashboardIndex,
})

const cards = [
  ['Total Properties', 'properties', '/properties.svg', '/dashboard/properties'],
  ['Total Files', 'files', '/files.svg', '/dashboard/files'],
  ['Total Queries', 'queries', '/queries.svg', '/dashboard/queries'],
  ['Total Maps', 'maps', '/maps.svg', '/dashboard/maps'],
]
const ranges = [['7d', 'Last 7 days'], ['30d', 'Last 30 days'], ['90d', 'Last 3 months'], ['all', 'All Time']]

function DashboardIndex() {
  const [collections, setCollections] = useState(null)
  const [timeRange, setTimeRange] = useState('7d')
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    Promise.all(['properties', 'files', 'queries', 'maps'].map(readAdminCollection))
      .then((data) => { if (active) setCollections(data) })
      .catch((caught) => { if (active) setError(caught.message) })
    return () => { active = false }
  }, [])

  const queryData = useMemo(() => {
    const byDate = new Map()
    for (const query of collections?.[2]?.items || []) {
      const date = new Date(String(query.created_at || '').replace(' ', 'T'))
      if (Number.isNaN(date.getTime())) continue
      const day = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' })
      byDate.set(day, (byDate.get(day) || 0) + 1)
    }
    const rows = [...byDate].map(([date, totalQueries]) => ({ date, totalQueries })).sort((a, b) => a.date.localeCompare(b.date))
    if (timeRange === 'all') return rows
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days)
    return rows.filter((row) => new Date(row.date) >= cutoff)
  }, [collections, timeRange])

  if (error) return <div className="p-6 text-center text-destructive" role="alert">Error loading dashboard: {error}</div>
  if (!collections) return <div className="dashboard-loading" role="status"><span className="dashboard-spinner" />Loading dashboard data…</div>

  return <section className="dashboard-overview">
    <h2>Welcome to your Dashboard!</h2>
    <div className="dashboard-stat-grid">{cards.map(([label, key, icon, href], index) => <Link key={key} to={href} className="dashboard-stat-card">
      <div><p>{label}</p><strong>{collections[index].count}</strong></div><img src={icon} alt="" aria-hidden="true" />
    </Link>)}</div>
    <section className="dashboard-chart-card" aria-labelledby="query-chart-title">
      <header><div><h3 id="query-chart-title">Total Queries</h3><p>Overview of customer queries over time</p></div>
        <div className="dashboard-chart-ranges" role="group" aria-label="Query chart date range">{ranges.map(([value, label]) => <button key={value} type="button" className={timeRange === value ? 'is-selected' : ''} aria-pressed={timeRange === value} onClick={() => setTimeRange(value)}>{label}</button>)}</div>
        <select className="dashboard-chart-select" value={timeRange} onChange={(event) => setTimeRange(event.target.value)} aria-label="Select query chart date range">{ranges.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      </header>
      <div className="dashboard-chart-plot">
        <div className="dashboard-chart-y-axis" aria-hidden="true"><span>{Math.max(1, ...queryData.map((row) => row.totalQueries))}</span><span>0</span></div>
        <div className="dashboard-chart-canvas">
          <svg viewBox="0 0 1000 220" role="img" aria-label={queryData.length ? `${queryData.reduce((sum, row) => sum + row.totalQueries, 0)} synthetic customer queries` : 'No dated synthetic query samples to chart'} preserveAspectRatio="none">
            <defs><linearGradient id="dashboard-query-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity=".24" /><stop offset="100%" stopColor="var(--primary)" stopOpacity=".02" /></linearGradient></defs>
            {[0, 1, 2, 3, 4].map((line) => <line key={line} x1="0" x2="1000" y1={line * 54 + 1} y2={line * 54 + 1} className="dashboard-chart-gridline" />)}
            {queryData.length > 0 && <ChartLine rows={queryData} />}
          </svg>
          {queryData.length === 0 && <p className="dashboard-chart-empty">No dated synthetic query samples yet.</p>}
          <div className="dashboard-chart-x-axis">{queryData.map((row) => <span key={row.date}>{new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'Asia/Karachi' })}</span>)}</div>
        </div>
      </div>
    </section>
    <p className="dashboard-synthetic-note">Dashboard metrics use synthetic staging records only.</p>
  </section>
}

function ChartLine({ rows }) {
  const max = Math.max(1, ...rows.map((row) => row.totalQueries))
  const points = rows.map((row, index) => `${rows.length === 1 ? 500 : (index / (rows.length - 1)) * 1000},${205 - (row.totalQueries / max) * 185}`)
  const stroke = points.join(' ')
  return <><polygon points={`0,220 ${stroke} 1000,220`} fill="url(#dashboard-query-fill)" /><polyline points={stroke} fill="none" className="dashboard-chart-line" /></>
}
