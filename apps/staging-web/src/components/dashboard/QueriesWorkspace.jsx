import { useEffect, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { createAdminRecord, deleteAdminRecord, readAdminCollection, updateAdminRecord } from '../../data/admin-api.js'
import SearchableSelectionField from './SearchableSelectionField.jsx'

const EMPTY_FORM = { property_id: '', property_title: '', name: '', email: '', phone: '', message: '' }

export default function QueriesWorkspace() {
  const [items, setItems] = useState(null)
  const [properties, setProperties] = useState([])
  const [search, setSearch] = useState('')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [selected, setSelected] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [draft, setDraft] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function refresh() {
    setError('')
    try {
      const [queries, listings] = await Promise.all([readAdminCollection('queries'), readAdminCollection('properties')])
      setItems(queries.items)
      setProperties(listings.items.filter((item) => item.visible))
    }
    catch (caught) { setError(caught.message) }
  }
  useEffect(() => { refresh() }, [])

  const filtered = useMemo(() => (items || []).filter((item) => {
    if (unreadOnly && item.is_read) return false
    return Object.values(item).some((value) => String(value ?? '').toLowerCase().includes(search.toLowerCase()))
  }), [items, search, unreadOnly])

  async function openQuery(item) {
    setSelected(item)
    if (item.is_read) return
    try {
      await updateAdminRecord('queries', item.id, { is_read: true })
      setItems((current) => current.map((query) => query.id === item.id ? { ...query, is_read: true } : query))
      setSelected((current) => current?.id === item.id ? { ...current, is_read: true } : current)
    } catch (caught) { setError(caught.message) }
  }

  async function toggleRead(item) {
    setBusy(true); setError('')
    try {
      await updateAdminRecord('queries', item.id, { is_read: !item.is_read })
      setItems((current) => current.map((query) => query.id === item.id ? { ...query, is_read: !item.is_read } : query))
      if (selected?.id === item.id) setSelected((current) => ({ ...current, is_read: !item.is_read }))
    } catch (caught) { setError(caught.message) } finally { setBusy(false) }
  }

  async function remove(item) {
    if (!window.confirm('Delete this synthetic query?')) return
    setBusy(true); setError('')
    try { await deleteAdminRecord('queries', item.id); setSelected(null); await refresh() }
    catch (caught) { setError(caught.message) } finally { setBusy(false) }
  }

  async function saveNew(event) {
    event.preventDefault(); setBusy(true); setError('')
    const form = new FormData(event.currentTarget)
    const value = Object.fromEntries(Object.keys(EMPTY_FORM).map((key) => [key, String(form.get(key) || '').trim()]))
    try {
      if (draft.id) await updateAdminRecord('queries', draft.id, value)
      else await createAdminRecord('queries', { ...value, created_at: new Date().toISOString().replace('T', ' ').slice(0, 19), is_read: false })
      setDraft(null); await refresh()
    }
    catch (caught) { setError(caught.message) } finally { setBusy(false) }
  }

  function exportSelected() {
    const rows = filtered.filter((item) => selectedIds.includes(item.id))
    if (!rows.length) return
    const columns = ['property_title', 'name', 'email', 'phone', 'message', 'created_at', 'is_read']
    const csv = [columns.join(','), ...rows.map((item) => columns.map((key) => {
      let value = String(item[key] ?? '')
      if (/^\s*[=+\-@]/.test(value)) value = `'${value}`
      value = value.replaceAll('"', '""')
      return `"${value}"`
    }).join(','))].join('\r\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    link.download = 'synthetic-queries.csv'; link.click(); URL.revokeObjectURL(link.href)
  }

  async function removeSelected() {
    const rows = filtered.filter((item) => selectedIds.includes(item.id))
    if (!rows.length || !window.confirm(`Delete ${rows.length} selected synthetic queries?`)) return
    setBusy(true); setError('')
    try {
      const results = await Promise.allSettled(rows.map((item) => deleteAdminRecord('queries', item.id)))
      if (results.some((result) => result.status === 'rejected')) throw new Error('Some selected queries could not be deleted.')
      setSelectedIds([]); await refresh()
    } catch (caught) { setError(caught.message) } finally { setBusy(false) }
  }

  function editQuery(item) {
    setSelected(null)
    setDraft({ id: item.id, property_id: item.property_id || '', property_title: item.property_title || '', name: item.name, email: item.email, phone: item.phone, message: item.message })
  }

  return <section className="dashboard-data-page">
    {error && <div className="dashboard-alert" role="alert"><span>{error}</span><button type="button" aria-label="Dismiss error" onClick={() => setError('')}><X size={16} /></button></div>}
    <div className="dashboard-data-heading"><div><h2>Property Queries</h2><p>Manage user inquiries from your website.</p></div><button className="dashboard-primary-button" type="button" onClick={() => setDraft({ ...EMPTY_FORM })}>Add New</button></div>
    <div className="dashboard-table-toolbar"><div className="dashboard-table-search"><Search aria-hidden="true" size={16} /><input aria-label="Filter queries" placeholder="Filter queries..." value={search} onChange={(event) => setSearch(event.target.value)} /></div><div className="dashboard-table-tools">{selectedIds.length > 0 && <span className="dashboard-selected-count">{selectedIds.length} selected</span>}<label className="queries-unread-toggle"><input type="checkbox" checked={unreadOnly} onChange={(event) => setUnreadOnly(event.target.checked)} />Unread only</label><button type="button" className="dashboard-outline-button" onClick={exportSelected} disabled={!filtered.some((item) => selectedIds.includes(item.id))}>Export CSV</button><button type="button" className="dashboard-outline-button" onClick={removeSelected} disabled={!selectedIds.length || busy}>Delete Selected</button></div></div>
    <div className="dashboard-table-wrap"><table className="dashboard-table"><thead><tr><th><input type="checkbox" aria-label="Select all filtered queries" checked={filtered.length > 0 && filtered.every((item) => selectedIds.includes(item.id))} onChange={(event) => setSelectedIds(event.target.checked ? [...new Set([...selectedIds, ...filtered.map((item) => item.id)])] : selectedIds.filter((id) => !filtered.some((item) => item.id === id)))} /></th><th>ID</th><th>Property</th><th>Name</th><th>Email</th><th>Phone</th><th>Message</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>
      {(filtered || []).map((item, index) => <tr key={item.id} className={item.is_read ? '' : 'queries-unread-row'}><td><input type="checkbox" aria-label={`Select query from ${item.name}`} checked={selectedIds.includes(item.id)} onChange={() => setSelectedIds((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])} /></td><td>{index + 1}</td><td>{item.property_title || <span className="queries-muted">N/A</span>}</td><td><button type="button" className="queries-name-button" onClick={() => openQuery(item)}>{item.name}</button></td><td>{item.email}</td><td>{item.phone}</td><td className="queries-message-cell" title={item.message}>{item.message}</td><td>{item.created_at}</td><td><span className={`queries-status ${item.is_read ? 'is-read' : 'is-unread'}`}>{item.is_read ? 'Read' : 'Unread'}</span></td><td className="queries-actions"><button type="button" onClick={() => openQuery(item)}>View</button><button type="button" disabled={busy} onClick={() => toggleRead(item)}>{item.is_read ? 'Mark unread' : 'Mark read'}</button><button type="button" disabled={busy} onClick={() => remove(item)}>Delete</button></td></tr>)}
      {items === null && <tr><td colSpan="10" className="dashboard-empty-cell">Loading synthetic queries…</td></tr>}{items && !filtered.length && <tr><td colSpan="10" className="dashboard-empty-cell">No matching queries found.</td></tr>}
    </tbody></table></div>
    <div className="dashboard-table-pagination"><p>{filtered.length} of {items?.length || 0} query(s).</p><span className="dashboard-data-note">Synthetic staging data only. Email and phone details are sample values; sending is disabled.</span></div>
    {selected && <div className="dashboard-sheet-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null) }}><section className="dashboard-sheet" role="dialog" aria-modal="true" aria-labelledby="query-detail-title"><header><div><h3 id="query-detail-title">Query Details</h3><p>Received {selected.created_at}</p></div><button type="button" aria-label="Close query details" onClick={() => setSelected(null)}><X size={18} /></button></header><dl className="query-detail-grid"><dt>Name</dt><dd>{selected.name}</dd><dt>Email</dt><dd>{selected.email}</dd><dt>Phone</dt><dd>{selected.phone}</dd><dt>Property</dt><dd>{selected.property_title || 'N/A'}</dd><dt>Message</dt><dd className="query-detail-message">{selected.message}</dd><dt>Status</dt><dd>{selected.is_read ? 'Read' : 'Unread'}</dd></dl><footer className="query-detail-actions"><button className="dashboard-outline-button" type="button" onClick={() => editQuery(selected)}>Edit</button><button className="dashboard-outline-button" type="button" onClick={() => toggleRead(selected)} disabled={busy}>{selected.is_read ? 'Mark unread' : 'Mark read'}</button><button className="dashboard-outline-button" type="button" onClick={() => remove(selected)} disabled={busy}>Delete query</button></footer></section></div>}
    {draft && <div className="dashboard-sheet-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDraft(null) }}><section className="dashboard-sheet" role="dialog" aria-modal="true" aria-labelledby="query-new-title"><header><div><h3 id="query-new-title">{draft.id ? 'Edit Query' : 'Add New Query'}</h3><p>{draft.id ? 'Update the selected query.' : 'Create a synthetic query for staging review.'}</p></div><button type="button" aria-label="Close query form" onClick={() => setDraft(null)}><X size={18} /></button></header><form onSubmit={saveNew}><div className="dashboard-sheet-fields"><div className="dashboard-form-field"><span className="dashboard-form-field-label">Related Property</span><SearchableSelectionField id="query-property-selector" label="Related Property" options={properties.map((property) => ({ value: property.id, label: property.title }))} value={draft.property_id || ''} onChange={(value) => { const property = properties.find((item) => String(item.id) === String(value)); setDraft((current) => ({ ...current, property_id: value, property_title: property?.title || '' })) }} placeholder="Select a property (optional)" /><input type="hidden" name="property_id" value={draft.property_id || ''} readOnly /><input type="hidden" name="property_title" value={draft.property_title || ''} readOnly /></div>{[['name','Name'],['email','Email'],['phone','Phone'],['message','Message']].map(([name,label]) => <label key={name}>{label}{name === 'message' ? <textarea name={name} required rows="5" defaultValue={draft[name] || ''} /> : <input name={name} type={name === 'email' ? 'email' : 'text'} required={name === 'name'} defaultValue={draft[name] || ''} />}</label>)}</div><p className="dashboard-data-note">New records remain synthetic and reset when the local API restarts.</p><footer><button className="dashboard-outline-button" type="button" onClick={() => setDraft(null)}>Cancel</button><button className="dashboard-primary-button" type="submit" disabled={busy}>{busy ? 'Saving…' : draft.id ? 'Save Changes' : 'Save Query'}</button></footer></form></section></div>}
  </section>
}
