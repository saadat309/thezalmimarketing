import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Columns3, Copy, FileDown, MoreHorizontal, Pencil, Plus, Search, Trash2, Upload, X } from 'lucide-react'
import { createAdminRecord, deleteAdminRecord, readAdminCollection, updateAdminRecord } from '../data/admin-api.js'
import QueriesWorkspace from '../components/dashboard/QueriesWorkspace.jsx'
import LandingPageWorkspace from '../components/dashboard/LandingPageWorkspace.jsx'
import CalculatorCsvImportDialog from '../components/dashboard/CalculatorCsvImportDialog.jsx'
import SyntheticLabelControl from '../components/dashboard/SyntheticLabelControl.jsx'

const titles = {
  properties: 'Manage Properties', files: 'Manage Files', maps: 'Manage Maps', cities: 'Manage Cities', categories: 'Manage Categories', societies: 'Manage Societies', phases: 'Manage Phases',
  queries: 'Customer Queries', 'landing-page': 'Manage Landing Page', 'calculator-phases': 'Calculator Phases', 'calculator-blocks': 'Calculator Blocks',
  'calculator-property-types': 'Calculator Property Types', 'calculator-rates': 'Calculator Rates', 'calculator-transfer-fees': 'Calculator Transfer Fees',
  'calculator-fees': 'Calculator Fees', 'calculator-tax-rates': 'Calculator Tax Rates', 'calculator-fee-rules': 'Calculator Fee Rules', users: 'Admin Users', profile: 'Profile',
}
export const Route = createFileRoute('/dashboard/$section')({ component: AdminSection })

function AdminSection() {
  const { section } = Route.useParams()
  if (section === 'queries') return <QueriesWorkspace />
  if (section === 'landing-page') return <LandingPageWorkspace />
  return <GenericAdminSection section={section} />
}

function GenericAdminSection({ section }) {
  const title = titles[section]
  const readOnly = section === 'users' || section === 'profile'
  const fixedPropertyTypes = section === 'calculator-property-types'
  const [payload, setPayload] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [selected, setSelected] = useState([])
  const [visibleColumns, setVisibleColumns] = useState(null)
  const [showColumns, setShowColumns] = useState(false)
  const [actionId, setActionId] = useState(null)
  const [editor, setEditor] = useState(null)
  const [draft, setDraft] = useState({})
  const [importOpen, setImportOpen] = useState(false)

  async function refresh() {
    if (!title) return
    setError('')
    try { setPayload(await readAdminCollection(section)) } catch (caught) { setError(caught.message) }
  }
  useEffect(() => { setPayload(null); setSelected([]); setQuery(''); setPage(0); refresh() }, [section])

  const items = section === 'profile' ? (payload?.user ? [payload.user] : []) : payload?.items || []
  const unavailableMapIds = new Set(items.filter((item) => item.id !== editor?.id).flatMap((item) => item.map_ids || []))
  const schema = payload?.fields || (items[0] ? Object.fromEntries(Object.keys(items[0]).filter((key) => key !== 'id').map((key) => [key, typeof items[0][key] === 'boolean' ? 'boolean' : 'text'])) : {})
  const fields = Object.entries(schema).map(([name, type]) => ({ name, type, label: labelFor(name) }))
  const fieldGroups = groupFields(section, fields, draft)
  const columnKeys = useMemo(() => (payload?.columns || ['id', ...Object.keys(schema)])
    .filter((key) => key !== 'id' || items.some((item) => item.id !== undefined)), [payload?.columns, schema, items])
  const [columnSelectionReady, setColumnSelectionReady] = useState(false)
  useEffect(() => { setVisibleColumns(columnKeys); setColumnSelectionReady(true) }, [columnKeys.join('|')])
  const filtered = items.filter((item) => Object.values(item).some((value) => String(value ?? '').toLowerCase().includes(query.toLowerCase())))
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageItems = filtered.slice(page * pageSize, (page + 1) * pageSize)
  const displayedColumns = columnSelectionReady ? columnKeys.filter((key) => visibleColumns?.includes(key)) : columnKeys
  const transferPreviewAmount = Number(draft.reference_amount) || 0
  const transferPreviewSize = Number(draft.reference_size) || 0
  const transferPreviewIsSqft = draft.reference_unit === 'sqft'
  const transferPreviewBase = Math.max(0, transferPreviewAmount - 10500)
  const transferPreviewMarla = transferPreviewIsSqft ? transferPreviewSize / 225 : transferPreviewSize
  const transferPreviewSqft = transferPreviewIsSqft ? transferPreviewSize : transferPreviewSize * 225
  const transferPreviewPerMarla = transferPreviewMarla > 0 ? transferPreviewBase / transferPreviewMarla : 0
  const transferPreviewPerSqft = transferPreviewSqft > 0 ? transferPreviewBase / transferPreviewSqft : 0

  async function removeSelected() {
    if (!selected.length || !window.confirm(`Delete ${selected.length} selected synthetic ${singularFor(section)} record(s)?`)) return
    setBusy(true); setError('')
    const results = await Promise.allSettled(selected.map((id) => deleteAdminRecord(section, id)))
    const failures = results.filter((result) => result.status === 'rejected').length
    if (failures) setError(`${failures} selected ${singularFor(section)} record(s) could not be deleted.`)
    else setSelected([])
    await refresh()
    setBusy(false)
  }

  function startCreate() {
    setActionId(null); setEditor({ kind: 'create' })
    const initial = Object.fromEntries(fields.map(({ name, type }) => [name, type === 'boolean' ? section.startsWith('calculator-') && name === 'is_active' : type === 'number' || type === 'integer' ? 0 : '']))
    if (section === 'properties') {
      for (const [name, options] of Object.entries(payload?.options || {})) if (['select', 'optionalSelect'].includes(schema[name]) && options.length) initial[name] = options[0].value
      Object.assign(initial, { property_type: 'Residential', purchase_type: 'sale', unit: 'sqft', price_period_unit: 'month', price_period_value: 1, installment_display_mode: 'installment', vat_amount: 0, is_furnished: true, template: 'default', related_products: [], labels: [], hide: false })
    }
    if (section === 'files') Object.assign(initial, { property_type: 'Residential', file_type: 'Affidavit', purchase_type: 'sale', unit: 'marla', price_period_unit: 'month', price_period_value: 1, installment_display_mode: 'installment', is_discounted: false, labels: [], hide: false })
    if (section === 'maps') initial.hide = false
    if (section === 'calculator-transfer-fees') Object.assign(initial, { category: 'Residential', reference_size: 5, reference_unit: 'marla' })
    if (section === 'calculator-tax-rates') Object.assign(initial, { rate: 0, rate_unit: 'percent' })
    if (section === 'calculator-fee-rules') Object.assign(initial, { property_type: 'Residential', unit: 'marla', min_area: 0, max_area: '', fee_amount: 0 })
    if (['cities', 'societies', 'phases'].includes(section)) initial.map_ids = []
    setDraft(initial)
  }
  function startEdit(item) {
    setActionId(null); setEditor({ kind: 'edit', id: item.id })
    setDraft(Object.fromEntries(fields.map(({ name }) => [name, item[name] ?? ''])))
  }
  async function save(event) {
    event.preventDefault(); setBusy(true); setError('')
    const values = Object.fromEntries(fields
      .filter(({ name, type }) => !(section === 'calculator-fees' && editor.kind === 'edit' && ['fee_key', 'charge_unit'].includes(name)) && !(section === 'calculator-tax-rates' && editor.kind === 'edit' && ['rate_key', 'rate_unit'].includes(name)) && !(fixedPropertyTypes && ['category', 'property_type'].includes(name)) && (!['text', 'slug'].includes(type) || String(draft[name] ?? '').trim() !== '' || ['title', 'name', 'fee_name', 'rate_name', 'label'].includes(name)))
      .map(({ name, type }) => [name, section === 'calculator-fee-rules' && name === 'max_area' || section === 'properties' && type === 'optionalInteger'
        ? (draft[name] === '' || draft[name] == null ? null : Number(draft[name]))
        : ['integer', 'number', 'optionalInteger', 'optionalNumber'].includes(type) ? Number(draft[name]) : draft[name]]))
    try {
      if (editor.kind === 'create') await createAdminRecord(section, values)
      else await updateAdminRecord(section, editor.id, values)
      setEditor(null); setDraft({}); await refresh()
    } catch (caught) { setError(caught.message) } finally { setBusy(false) }
  }
  async function remove(id) {
    setActionId(null)
    if (!window.confirm('Delete this synthetic sample record?')) return
    setBusy(true); setError('')
    try { await deleteAdminRecord(section, id); setSelected((current) => current.filter((key) => key !== id)); await refresh() }
    catch (caught) { setError(caught.message) } finally { setBusy(false) }
  }
  function duplicate(item) {
    const rest = Object.fromEntries(fields.map(({ name }) => [name, item[name] ?? '']))
    setEditor({ kind: 'create' }); setDraft(rest); setActionId(null)
  }
  function toggleSelected(id) { setSelected((current) => current.includes(id) ? current.filter((key) => key !== id) : [...current, id]) }
  function exportSelectedCsv() {
    const columns = columnKeys.filter((key) => visibleColumns?.includes(key))
    const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
    const rows = [columns.map((key) => labelFor(key)), ...items.filter((item) => selected.includes(item.id)).map((item) => columns.map((key) => item[key] ?? ''))]
    const csv = rows.map((row) => row.map(quote).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url; link.download = `calculator-${section.replace('calculator-', '')}.csv`; link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  if (!title) return <div className="dashboard-page"><p className="dashboard-eyebrow">ROUTE NOT FOUND</p><h2>Unknown dashboard section</h2></div>
  return <section className="dashboard-data-page">
    {error && <div className="dashboard-alert" role="alert"><span>{error}</span><button type="button" aria-label="Dismiss error" onClick={() => setError('')}><X size={16} /></button></div>}
    {notice && <div className="dashboard-success-alert" role="status">{notice}<button type="button" aria-label="Dismiss message" onClick={() => setNotice('')}><X size={16} /></button></div>}
    <div className="dashboard-data-heading"><div><h2>{title}</h2><p>{readOnly ? 'Read-only staging view. User and profile management are intentionally disabled.' : `Manage ${section.replaceAll('-', ' ')} in the synthetic staging workspace.`}</p></div>
      <div className="dashboard-heading-actions">{['calculator-rates', 'calculator-transfer-fees'].includes(section) && <button className="dashboard-outline-button" type="button" onClick={() => setImportOpen(true)}><Upload size={16} aria-hidden="true" />Import {section === 'calculator-rates' ? 'Rates' : 'Transfer Fees'}</button>}{!readOnly && !fixedPropertyTypes && payload?.fields && <button className="dashboard-primary-button" type="button" onClick={startCreate}><Plus size={16} aria-hidden="true" />Add New</button>}</div>
    </div>
    <div className="dashboard-table-toolbar">
      <div className="dashboard-table-search"><Search aria-hidden="true" size={16} /><input id="dashboard-table-filter" name="dashboardFilter" autoComplete="off" value={query} onChange={(event) => { setQuery(event.target.value); setPage(0) }} placeholder={`Filter ${section.replaceAll('-', ' ')}…`} aria-label={`Filter ${section.replaceAll('-', ' ')}`} /></div>
      <div className="dashboard-table-tools">
        {selected.length > 0 && !readOnly && <span className="dashboard-selected-count">{selected.length} selected</span>}
        {['calculator-rates', 'calculator-transfer-fees', 'calculator-fee-rules', 'calculator-phases', 'calculator-blocks', 'cities', 'categories', 'societies', 'phases'].includes(section) && selected.length > 0 && <button type="button" className="dashboard-outline-button" disabled={busy} onClick={removeSelected}><Trash2 size={15} aria-hidden="true" />Delete Selected</button>}
        <div className="dashboard-columns-menu"><button type="button" className="dashboard-outline-button" aria-expanded={showColumns} onClick={() => setShowColumns((open) => !open)}><Columns3 size={15} aria-hidden="true" />View</button>
          {showColumns && <div className="dashboard-columns-popover">{columnKeys.map((key) => <label key={key}><input type="checkbox" checked={visibleColumns?.includes(key) ?? true} onChange={() => setVisibleColumns((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key])} />{labelFor(key)}</label>)}<button type="button" onClick={() => setVisibleColumns(columnKeys)}>Reset View</button></div>}
        </div>
        {section === 'files' && <button type="button" className="dashboard-outline-button" disabled title="File export is not connected in the synthetic preview"><FileDown size={15} aria-hidden="true" />Export</button>}
        {['calculator-rates', 'calculator-transfer-fees', 'calculator-fees', 'calculator-tax-rates', 'calculator-fee-rules', 'calculator-phases', 'calculator-blocks', 'calculator-property-types', 'cities', 'categories', 'societies', 'phases'].includes(section) && <button type="button" className="dashboard-outline-button" disabled={selected.length === 0 || busy} onClick={exportSelectedCsv}><FileDown size={15} aria-hidden="true" />Export CSV</button>}
      </div>
    </div>
    <div className="dashboard-table-wrap"><table className="dashboard-table">
      <thead><tr><th className="dashboard-check-cell"><input id="dashboard-select-all" name="selectAllRows" type="checkbox" aria-label="Select all visible rows" checked={pageItems.length > 0 && pageItems.every((item) => selected.includes(item.id))} onChange={(event) => setSelected(event.target.checked ? [...new Set([...selected, ...pageItems.map((item) => item.id)])] : selected.filter((id) => !pageItems.some((item) => item.id === id)))} /></th>{displayedColumns.map((key) => <th key={key}>{labelFor(key)}</th>)}<th className="dashboard-actions-heading">Actions</th></tr></thead>
      <tbody>{pageItems.map((item) => <tr key={item.id} onDoubleClick={() => !readOnly && startEdit(item)}>
        <td className="dashboard-check-cell"><input id={`dashboard-select-${fieldInputId(item.id)}`} name={`select-${item.id}`} type="checkbox" aria-label={`Select ${item.title || item.name || item.id}`} checked={selected.includes(item.id)} onChange={() => toggleSelected(item.id)} /></td>
        {displayedColumns.map((key) => <td key={key}>{key === 'id' ? <span className="dashboard-record-id">{formatValue(item[key])}</span> : section.startsWith('calculator-') && key === 'is_active' ? <span className={`dashboard-status-pill ${item.is_active ? 'is-active' : 'is-inactive'}`}>{item.is_active ? 'Active' : 'Inactive'}</span> : ['calculator-fees', 'calculator-tax-rates'].includes(section) && ['fee_key', 'rate_key'].includes(key) ? <span className="calculator-fee-key">{item[key]}</span> : section === 'calculator-fee-rules' && ['fee_key', 'fee_id'].includes(key) ? <span className="calculator-fee-key">{item[key]}</span> : ['cities', 'societies', 'phases'].includes(section) && key === 'map_ids' ? (item.map_ids?.length ? `${item.map_ids.length} Maps` : 'None') : section === 'categories' && key === 'pic' ? (item.pic ? <span className="dashboard-record-id">Image attached</span> : 'No Image') : section === 'calculator-fees' && key === 'charge_unit' ? item[key][0].toUpperCase() + item[key].slice(1) : section === 'calculator-rates' && ['dc_rate', 'fbr_rate'].includes(key) ? Number(item[key] || 0).toLocaleString() : section === 'calculator-fees' && key === 'amount' ? `Rs. ${Number(item[key] || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : section === 'calculator-tax-rates' && key === 'rate' ? `${Number(item[key] || 0).toFixed(4)}%` : section === 'calculator-transfer-fees' && ['reference_amount', 'base_transfer_fee', 'per_marla_rate', 'per_sqft_rate'].includes(key) ? `Rs. ${Number(item[key] || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: key === 'per_sqft_rate' ? 4 : 2 })}` : section === 'calculator-fee-rules' && ['min_area', 'max_area'].includes(key) ? (item[key] == null ? 'No Max (Unlimited)' : `${Number(item[key]).toLocaleString()} ${item.unit}`) : section === 'calculator-fee-rules' && key === 'fee_amount' ? `Rs. ${Number(item[key] || 0).toLocaleString()}` : formatValue(item[key])}</td>)}
        <td className="dashboard-row-actions"><button type="button" className="dashboard-icon-button" aria-label={`Actions for ${item.title || item.name || item.id}`} aria-expanded={actionId === item.id} onClick={() => setActionId((current) => current === item.id ? null : item.id)}><MoreHorizontal size={18} /></button>
          {actionId === item.id && <div className="dashboard-row-menu">{!readOnly && <><button type="button" onClick={() => startEdit(item)}><Pencil size={15} />Edit</button>{!fixedPropertyTypes && <button type="button" onClick={() => duplicate(item)}><Copy size={15} />Duplicate</button>}{!['calculator-fees', 'calculator-tax-rates', 'calculator-property-types'].includes(section) && <button className="is-danger" type="button" onClick={() => remove(item.id)}><Trash2 size={15} />Delete</button>}</>}</div>}
        </td>
      </tr>)}
      {!pageItems.length && <tr><td colSpan={displayedColumns.length + 2} className="dashboard-empty-cell">{payload ? (query ? 'No matching records found.' : 'No synthetic records yet.') : 'Loading local sample data…'}</td></tr>}
      </tbody>
    </table></div>
    <div className="dashboard-table-pagination"><p>{selected.length} of {filtered.length} row(s) selected.</p><div className="dashboard-page-size"><label htmlFor="dashboard-page-size">Rows per page</label><select id="dashboard-page-size" name="pageSize" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(0) }}>{[10, 20, 30, 40, 50].map((size) => <option key={size} value={size}>{size}</option>)}</select></div><span className="dashboard-page-count">Page {page + 1} of {pageCount}</span><div className="dashboard-page-controls"><button type="button" aria-label="Go to first page" disabled={page === 0} onClick={() => setPage(0)}><ChevronsLeft size={16} /></button><button type="button" aria-label="Go to previous page" disabled={page === 0} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={16} /></button><button type="button" aria-label="Go to next page" disabled={page >= pageCount - 1} onClick={() => setPage((value) => value + 1)}><ChevronRight size={16} /></button><button type="button" aria-label="Go to last page" disabled={page >= pageCount - 1} onClick={() => setPage(pageCount - 1)}><ChevronsRight size={16} /></button></div></div>
    <p className="dashboard-data-note">{readOnly ? 'The two staging accounts are synthetic and share the Admin role.' : 'Changes apply only to in-memory synthetic samples and reset when the local API restarts.'}{['files', 'maps', 'properties', 'landing-page'].includes(section) && ' Media storage is not connected.'}{section.startsWith('calculator-') && ' Some calculator CSV import and PDF export workflows remain unported.'}</p>

    {editor && <div className="dashboard-sheet-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditor(null) }}>
      <section className="dashboard-sheet" role="dialog" aria-modal="true" aria-labelledby="dashboard-editor-title"><header><div><h3 id="dashboard-editor-title">{editor.kind === 'edit' ? `Edit ${singularFor(section)}` : `Add New ${singularFor(section)}`}</h3><p>{editor.kind === 'edit' ? `Make changes to your ${singularFor(section)} here.` : `Add a new ${singularFor(section)} to your list.`}</p></div><button type="button" aria-label="Close editor" onClick={() => setEditor(null)}><X size={18} /></button></header>
        <form onSubmit={save}><div className="dashboard-sheet-groups">{fieldGroups.map((group) => <fieldset className="dashboard-sheet-group" key={group.title}><legend>{group.title}</legend><div className="dashboard-sheet-fields">{group.fields.map((field) => <label key={field.name} className={field.type === 'boolean' ? 'dashboard-boolean-field' : ''}>
          {field.type === 'boolean' ? <><input id={fieldInputId(field.name)} name={field.name} type="checkbox" checked={Boolean(draft[field.name])} onChange={(event) => setDraft((current) => ({ ...current, [field.name]: event.target.checked }))} />{field.label}</> : <>{field.label}{field.type === 'textarea' ? <textarea id={fieldInputId(field.name)} name={field.name} autoComplete="off" value={draft[field.name] ?? ''} onChange={(event) => setDraft((current) => ({ ...current, [field.name]: event.target.value }))} /> : field.type === 'multiSelect' ? field.name === 'labels' ? <SyntheticLabelControl options={payload?.options?.[field.name] || []} value={draft[field.name] || []} onChange={(value) => setDraft((current) => ({ ...current, [field.name]: value }))} onLabelsChanged={refresh} /> : <><select id={fieldInputId(field.name)} name={field.name} multiple size={4} value={draft[field.name] || []} onChange={(event) => setDraft((current) => ({ ...current, [field.name]: Array.from(event.target.selectedOptions, (option) => option.value) }))}>{(payload?.options?.[field.name] || []).filter((option) => draft[field.name]?.includes(option.value) || !unavailableMapIds.has(option.value)).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><small className="dashboard-field-help">{['properties', 'files'].includes(section) ? 'Choose from synthetic related properties or labels.' : 'Use Ctrl (Windows) or Command (Mac) to select multiple maps.'}</small></> : ['select', 'optionalSelect'].includes(field.type) ? <select id={fieldInputId(field.name)} name={field.name} required={field.type === 'select' && (section.startsWith('calculator-') || ['property_type', 'purchase_type', 'file_type', 'price_period_unit', 'installment_display_mode', 'template'].includes(field.name))} value={draft[field.name] ?? ''} disabled={(field.name === 'calculator_block_id' && !draft.calculator_phase_id) || (section === 'calculator-fees' && editor.kind === 'edit' && field.name === 'charge_unit') || (section === 'calculator-tax-rates' && editor.kind === 'edit' && field.name === 'rate_unit')} onChange={(event) => setDraft((current) => ({ ...current, [field.name]: event.target.value }))}><option value="">{field.name === 'calculator_block_id' ? (draft.calculator_phase_id ? (section === 'calculator-transfer-fees' ? 'Phase-level fee (no block)' : 'Phase-level rate (no block)') : 'Select a phase first') : 'Select an option'}</option>{(payload?.options?.[field.name] || []).filter((option) => field.name !== 'calculator_block_id' || option.phaseId === draft.calculator_phase_id).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input id={fieldInputId(field.name)} name={field.name} autoComplete="off" disabled={(section === 'calculator-fees' && editor.kind === 'edit' && field.name === 'fee_key') || (section === 'calculator-tax-rates' && editor.kind === 'edit' && field.name === 'rate_unit') || (fixedPropertyTypes && editor.kind === 'edit' && ['category', 'property_type'].includes(field.name))} required={['title', 'name', 'dc_rate', 'fbr_rate', 'reference_amount', 'reference_size', 'fee_key', 'fee_name', 'amount', 'rate_key', 'rate_name', 'rate', 'min_area', 'fee_amount', 'label'].includes(field.name)} type={['integer', 'number', 'optionalInteger', 'optionalNumber'].includes(field.type) ? 'number' : 'text'} min={field.name === 'price_period_value' ? 1 : field.name === 'reference_size' ? 0.0001 : field.name === 'reference_amount' ? 10500.01 : ['number', 'optionalNumber', 'optionalInteger'].includes(field.type) || field.type === 'integer' && field.name !== 'sort_order' ? 0 : undefined} step={['integer', 'optionalInteger'].includes(field.type) ? 1 : ['min_area', 'max_area', 'fee_amount'].includes(field.name) ? '0.01' : field.name === 'rate' ? '0.0001' : ['number', 'optionalNumber'].includes(field.type) ? 'any' : undefined} value={draft[field.name] ?? ''} onChange={(event) => setDraft((current) => ({ ...current, [field.name]: event.target.value }))} />}</>}
        </label>)}</div></fieldset>)}</div>{section === 'calculator-transfer-fees' && <div className="dashboard-calculator-preview"><h4>Derived Calculation Preview <span>(Sports Fund = Rs. 10,500)</span></h4><div className="dashboard-calculator-preview-grid"><div><small>Base Transfer Fee</small><strong>Rs. {transferPreviewBase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div><div><small>Per Marla Rate</small><strong>Rs. {transferPreviewPerMarla.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / Marla</strong></div><div><small>Reference Sq.Ft.</small><strong>{transferPreviewSqft.toLocaleString()} Sq.Ft.</strong></div><div><small>Per Sq.Ft. Rate</small><strong>Rs. {transferPreviewPerSqft.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} / Sq.Ft.</strong></div></div><p>Reference transfer fee must exceed Rs. 10,500 and reference size must be greater than zero.</p></div>}{section === 'calculator-tax-rates' && <p className="dashboard-data-note">Enter the percentage as displayed, for example 1.25 means 1.25%, not 125%. The rate unit is fixed to percent.</p>}{['properties', 'files', 'maps', 'categories'].includes(section) && <div className="dashboard-media-placeholder"><strong>{section === 'properties' ? 'Thumbnail and Media Gallery' : section === 'files' ? 'File Media' : section === 'maps' ? 'Map Media' : 'Category Image'}</strong><span>{section === 'properties' ? 'Thumbnail, up to 10 gallery images, video upload (500 MB maximum) or embed are represented in the source form. Staging upload/storage controls are disabled; no files are sent.' : section === 'files' ? 'Property file thumbnail and image uploads are represented but disabled in staging; no file upload or storage call is made.' : section === 'maps' ? 'The source allows one map image and one PDF (up to 100 MB). Upload and removal remain disabled; no file upload or storage call is made.' : 'Category image upload/removal remains disabled in staging.'}</span>{section !== 'categories' && <div className="dashboard-media-disabled-controls"><button type="button" disabled>{section === 'maps' ? 'Choose Map Image (max 1)' : 'Choose Thumbnail'}</button><button type="button" disabled>{section === 'maps' ? 'Choose Map PDF (max 1 · 100 MB)' : 'Add Images (media disabled)'}</button></div>}</div>}<p className="dashboard-data-note">Synthetic staging data only. Uploads and external actions are disabled.</p><footer><button className="dashboard-outline-button" type="button" onClick={() => setEditor(null)}>Cancel</button><button className="dashboard-primary-button" type="submit" disabled={busy}>{busy ? 'Saving…' : editor.kind === 'edit' ? 'Save changes' : 'Add record'}</button></footer></form>
      </section>
    </div>}
    {importOpen && <CalculatorCsvImportDialog domain={section} onClose={() => setImportOpen(false)} onSuccess={async (result) => { setImportOpen(false); setNotice(result?.message || 'Calculator CSV import completed.'); await refresh() }} />}
  </section>
}

function labelFor(value) {
  const labels = { map_ids: 'Associated Maps', fee_id: 'Fee', min_area: 'Minimum Area', max_area: 'Maximum Area (Optional / Unlimited if empty)', fee_amount: 'Fee Amount (Rs.)', pic: 'Image' }
  return labels[value] || value.replace(/([a-z])([A-Z])/g, '$1 $2').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}
function fieldInputId(value) { return `admin-field-${String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}` }
function groupFields(section, fields, draft = {}) {
  const definitions = {
    properties: [['General Information', ['title', 'short_desc', 'address']], ['Property Classification', ['property_type', 'purchase_type', 'is_furnished']], ['Base Pricing', ['price_amount', 'price_period_unit', 'price_period_value', 'is_discounted', 'price_original_amount']], ['Installment Details', ['installment_advance_amount', 'installment_total_period_text', 'installment_amount', 'installment_display_mode']], ['Relations', ['category_id', 'city_id', 'society_id', 'phase_id', 'related_products', 'labels']], ['Physical Specifications', ['beds', 'baths', 'area', 'unit']], ['Property Features & Taxation', ['features', 'vat_amount']], ['Video / Embed Link', ['embed_link']], ['Detailed Descriptions', ['detailed_description_content']], ['Publishing Settings', ['template', 'hide']]],
    files: [['File Property Information', ['title', 'short_desc', 'address', 'property_type', 'file_type', 'purchase_type']], ['Area & Pricing', ['area', 'unit', 'price_amount', 'is_discounted', 'price_original_amount', 'price_period_unit', 'price_period_value']], ['Installment Details', ['installment_amount', 'installment_total_period_text', 'installment_advance_amount', 'installment_display_mode']], ['Relations & Labels', ['city_id', 'society_id', 'phase_id', 'embed_link', 'labels']], ['Publishing Settings', ['hide']]],
    maps: [['Map Information', ['title', 'description', 'embed_link']], ['Relations', ['city_id', 'society_id', 'phase_id']], ['Publishing Settings', ['hide']]],
    'calculator-phases': [['Phase Location', ['city_id', 'society_id']], ['Calculator Phase Information', ['name', 'sort_order']], ['Publishing Settings', ['is_active']]],
    'calculator-blocks': [['Phase Assignment', ['calculator_phase_id']], ['Block Information', ['name', 'sort_order']], ['Publishing Settings', ['is_active']]],
    'calculator-property-types': [['Fixed Classification', ['category', 'property_type']], ['Display Settings', ['label', 'sort_order']], ['Publishing Settings', ['is_active']]],
    'calculator-rates': [['Calculator Rate Information', ['calculator_phase_id', 'calculator_block_id', 'calculator_property_type_id']], ['Rate Values', ['unit', 'dc_rate', 'fbr_rate']], ['Publishing Settings', ['is_active']]],
    'calculator-transfer-fees': [['Calculator Transfer Fee Configuration', ['calculator_phase_id', 'calculator_block_id', 'category']], ['Reference Fee Values', ['reference_size', 'reference_unit', 'reference_amount']], ['Publishing Settings', ['is_active']]],
    'calculator-fees': [['Calculator Fee Configuration', ['fee_key', 'charge_unit']], ['Fee Details', ['fee_name', 'amount']], ['Publishing Settings', ['is_active']]],
    'calculator-tax-rates': [['Calculator Tax Rate Configuration', ['rate_key', 'rate_unit']], ['Tax Rate Details', ['rate_name', 'rate']], ['Publishing Settings', ['is_active']]],
    'calculator-fee-rules': [['Fee & Property Type', ['fee_id', 'property_type']], ['Area Range', ['unit', 'min_area', 'max_area']], ['Fee & Publishing Settings', ['fee_amount', 'is_active']]],
    cities: [['City Information', ['name']], ['Associated Maps', ['map_ids']]],
    categories: [['Category Information', ['name']]],
    societies: [['Society Information', ['name']], ['Associated Maps', ['map_ids']]],
    phases: [['Phase Information', ['name']], ['Associated Maps', ['map_ids']]],
  }
  if (section === 'properties') {
    if (!['installment', 'rent'].includes(draft.purchase_type)) definitions.properties[2][1] = ['price_amount', 'is_discounted', 'price_original_amount']
    if (draft.purchase_type !== 'installment') definitions.properties = definitions.properties.filter(([title]) => title !== 'Installment Details')
    if (!draft.is_discounted) definitions.properties[2][1] = definitions.properties[2][1].filter((name) => name !== 'price_original_amount')
  }
  if (section === 'files') {
    if (draft.purchase_type !== 'installment') definitions.files = definitions.files.map(([title, names]) => [title, names.filter((name) => !['price_period_unit', 'price_period_value'].includes(name))]).filter(([title]) => title !== 'Installment Details')
    if (!draft.is_discounted) definitions.files[1][1] = definitions.files[1][1].filter((name) => name !== 'price_original_amount')
  }
  const groups = definitions[section]
  if (!groups) return [{ title: 'Record Information', fields }]
  const remaining = new Map(fields.map((field) => [field.name, field]))
  return groups.map(([title, names]) => ({ title, fields: names.map((name) => remaining.get(name)).filter(Boolean) })).filter((group) => group.fields.length)
}
function singularFor(value) {
  const irregular = { properties: 'property', categories: 'category', societies: 'society', phases: 'phase', queries: 'query', files: 'file', maps: 'map', users: 'user', 'calculator-fee-rules': 'calculator fee rule' }
  return irregular[value] || value.replace(/s$/, '').replaceAll('-', ' ')
}
function formatValue(value) { return value === undefined || value === null || value === '' ? '—' : typeof value === 'boolean' ? value ? 'Yes' : 'No' : String(value) }
