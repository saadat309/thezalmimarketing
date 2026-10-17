import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { createAdminRecord, deleteAdminRecord, readAdminCollection, updateAdminRecord } from '../data/admin-api.js'

const titles = {
  properties: 'Properties', files: 'Files', maps: 'Maps', cities: 'Cities', categories: 'Categories', societies: 'Societies', phases: 'Phases',
  queries: 'Queries', 'landing-page': 'Landing Page Sections', 'calculator-phases': 'Calculator Phases', 'calculator-blocks': 'Calculator Blocks',
  'calculator-property-types': 'Calculator Property Types', 'calculator-rates': 'Calculator Rates', 'calculator-transfer-fees': 'Calculator Transfer Fees',
  'calculator-fees': 'Calculator Fees', 'calculator-tax-rates': 'Calculator Tax Rates', 'calculator-fee-rules': 'Calculator Fee Rules',
  users: 'Admin Accounts', profile: 'Current Admin Profile',
}

export const Route = createFileRoute('/dashboard/$section')({ component: AdminSection })

function AdminSection() {
  const { section } = Route.useParams()
  const title = titles[section]
  const readOnly = section === 'users' || section === 'profile'
  const [payload, setPayload] = useState(null)
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const schema = payload?.fields || {}
  const fields = useMemo(() => Object.entries(schema), [schema])

  async function refresh() {
    if (!title) return
    setError('')
    try { setPayload(await readAdminCollection(section)) }
    catch (caught) { setError(caught.message) }
  }
  useEffect(() => { refresh() }, [section])

  function startCreate() {
    setEditing(null)
    setDraft(Object.fromEntries(fields.map(([key, type]) => [key, type === 'boolean' ? true : ['number', 'integer'].includes(type) ? 0 : ''])))
  }
  function startEdit(item) {
    setEditing(item.id)
    setDraft(Object.fromEntries(fields.map(([key]) => [key, item[key]])))
  }
  async function save(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (editing) await updateAdminRecord(section, editing, draft)
      else await createAdminRecord(section, draft)
      setDraft({}); setEditing(null); await refresh()
    } catch (caught) { setError(caught.message) }
    finally { setBusy(false) }
  }
  async function remove(id) {
    if (!window.confirm('Delete this synthetic sample record?')) return
    setBusy(true)
    try { await deleteAdminRecord(section, id); await refresh() }
    catch (caught) { setError(caught.message) }
    finally { setBusy(false) }
  }

  if (!title) return <section><p className="admin-eyebrow">ROUTE NOT FOUND</p><h1 className="admin-page-title">Unknown dashboard section</h1></section>
  const items = section === 'profile' ? (payload?.user ? [payload.user] : []) : payload?.items || []

  return <section>
    <p className="admin-eyebrow">SYNTHETIC ADMIN DATA</p><div className="admin-section-heading"><div><h1 className="admin-page-title">{title}</h1><p className="admin-muted">{readOnly ? 'Read-only staging view. User and profile management are intentionally disabled.' : 'Edits affect local synthetic data only and reset when the API process restarts.'}</p></div>{!readOnly && <button className="admin-primary-button" type="button" onClick={startCreate}>Add sample record</button>}</div>
    {error && <p className="admin-error" role="alert">{error}</p>}
    {draft && Object.keys(draft).length > 0 && !readOnly && <form className="admin-editor" onSubmit={save}><h2>{editing ? 'Edit sample record' : 'New sample record'}</h2><div className="admin-editor-grid">{fields.map(([key, type]) => { const numeric = type === 'number' || type === 'integer'; return <label key={key} htmlFor={`admin-field-${key}`}>{labelFor(key)}{type === 'boolean' ? <input id={`admin-field-${key}`} name={key} type="checkbox" checked={Boolean(draft[key])} onChange={(event) => setDraft({ ...draft, [key]: event.target.checked })} /> : <input id={`admin-field-${key}`} name={key} type={numeric ? 'number' : 'text'} min={numeric ? 0 : undefined} step={type === 'integer' ? 1 : undefined} value={draft[key] ?? ''} maxLength={numeric ? undefined : 300} required={type !== 'boolean'} onChange={(event) => setDraft({ ...draft, [key]: numeric ? Number(event.target.value) : event.target.value })} />}</label> })}</div><div className="admin-actions"><button className="admin-primary-button" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save sample'}</button><button className="admin-secondary-button" type="button" onClick={() => { setDraft({}); setEditing(null) }}>Cancel</button></div></form>}
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Record</th>{fields.slice(0, 3).map(([key]) => <th key={key}>{labelFor(key)}</th>)}<th>{readOnly ? 'Role' : 'Actions'}</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><th scope="row">{item.title || item.name || item.sectionName || item.email || item.id}</th>{fields.slice(0, 3).map(([key]) => <td key={key}>{String(item[key] ?? '—')}</td>)}<td>{readOnly ? item.role || 'Admin' : <div className="admin-row-actions"><button type="button" onClick={() => startEdit(item)}>Edit</button><button type="button" onClick={() => remove(item.id)}>Delete</button></div>}</td></tr>)}{!items.length && <tr><td colSpan={Math.max(fields.length + 1, 2)} className="admin-empty">{payload ? 'No synthetic records yet.' : 'Loading local sample data…'}</td></tr>}</tbody></table></div>
    {section === 'users' && <p className="admin-muted">Exactly two synthetic accounts share the hardcoded Admin role. Invitations, role editing, and user CRUD are not available.</p>}
    {['files', 'maps', 'properties', 'landing-page'].includes(section) && <p className="admin-muted">Uploads and media changes are disabled in this slice. File imports/exports and external notifications are not connected.</p>}
    {section.startsWith('calculator-') && <p className="admin-muted">This is synthetic record management only; calculator formula behavior and CSV import/export remain unported.</p>}
  </section>
}

function labelFor(key) {
  return key.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`).replace(/^./, (letter) => letter.toUpperCase())
}
