import { useMemo, useState } from 'react'
import { GripVertical } from 'lucide-react'
import { createAdminRecord, deleteAdminRecord, updateAdminRecord } from '../../data/admin-api.js'

export default function SyntheticLabelControl({ options, value, onChange, onLabelsChanged }) {
  const selected = value || []
  const [search, setSearch] = useState('')
  const [newName, setNewName] = useState('')
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const bySlug = useMemo(() => new Map(options.map((option) => [option.value, option])), [options])
  const available = options.filter((option) => !selected.includes(option.value) && option.label.toLowerCase().includes(search.trim().toLowerCase()))

  function move(index, offset) {
    const nextIndex = index + offset
    if (nextIndex < 0 || nextIndex >= selected.length) return
    const next = [...selected]
    ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
    onChange(next)
  }

  async function toggleBadge(slug, isBadge) {
    setBusy(slug); setError('')
    try { await updateAdminRecord('labels', slug, { is_badge: isBadge }); await onLabelsChanged() }
    catch (caught) { setError(caught.message) }
    finally { setBusy('') }
  }

  async function createLabel(event) {
    event.preventDefault()
    const name = newName.trim()
    if (!name) return
    setBusy('create'); setError('')
    try {
      const { item } = await createAdminRecord('labels', { name })
      onChange([...selected, item.slug]); setNewName(''); await onLabelsChanged()
    } catch (caught) { setError(caught.message) }
    finally { setBusy('') }
  }

  async function deleteLabel(label) {
    if (!window.confirm(`Delete “${label.label}” globally? This removes it from every synthetic property and file.`)) return
    setBusy(label.value); setError('')
    try {
      await deleteAdminRecord('labels', label.value)
      onChange(selected.filter((slug) => slug !== label.value)); await onLabelsChanged()
    } catch (caught) { setError(caught.message) }
    finally { setBusy('') }
  }

  return <div className="dashboard-label-control">
    <div className="dashboard-label-selected" aria-label="Selected labels">
      {selected.length ? selected.map((slug, index) => {
        const label = bySlug.get(slug) || { value: slug, label: slug, isBadge: false }
        return <div className="dashboard-label-row" key={slug} onDragOver={(event) => event.preventDefault()} onDrop={(event) => {
          event.preventDefault()
          const from = selected.indexOf(event.dataTransfer.getData('text/plain'))
          if (from < 0 || from === index) return
          const next = [...selected]
          const [dragged] = next.splice(from, 1)
          next.splice(index, 0, dragged)
          onChange(next)
        }}>
          <div className="dashboard-label-item"><button type="button" className="dashboard-label-drag" draggable aria-label={`Drag ${label.label} to reorder`} onDragStart={(event) => { event.dataTransfer.setData('text/plain', slug); event.dataTransfer.effectAllowed = 'move' }}><GripVertical size={16} aria-hidden="true" /></button><span className="dashboard-label-chip">{label.label}</span></div>
          <div className="dashboard-label-actions">
            <button type="button" aria-label={`Move ${label.label} up`} disabled={index === 0} onClick={() => move(index, -1)}>↑</button>
            <button type="button" aria-label={`Move ${label.label} down`} disabled={index === selected.length - 1} onClick={() => move(index, 1)}>↓</button>
            <button type="button" aria-label={`Remove ${label.label} from this record`} onClick={() => onChange(selected.filter((entry) => entry !== slug))}>Remove</button>
            <button type="button" className="is-danger" disabled={Boolean(busy)} onClick={() => deleteLabel(label)}>Delete globally</button>
          </div>
          <label className="dashboard-label-badge"><input type="checkbox" checked={Boolean(label.isBadge)} disabled={busy === slug} onChange={(event) => toggleBadge(slug, event.target.checked)} />Show badge publicly</label>
        </div>
      }) : <p className="dashboard-field-help">No labels selected.</p>}
    </div>

    <label className="dashboard-label-search">Search available labels<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search labels…" /></label>
    <div className="dashboard-label-choices" role="group" aria-label="Available labels">
      {available.map((label) => <div key={label.value} className="dashboard-label-choice"><label><input type="checkbox" aria-label={`Add ${label.label}`} checked={false} disabled={Boolean(busy)} onChange={() => onChange([...selected, label.value])} /><span>{label.label}{label.isBadge ? ' · badge' : ''}</span></label><button type="button" disabled={Boolean(busy)} onClick={() => deleteLabel(label)}>Delete globally</button></div>)}
      {!available.length && <p className="dashboard-field-help">{search ? 'No matching available labels.' : 'No available labels.'}</p>}
    </div>
    <form className="dashboard-label-create" onSubmit={createLabel}><label htmlFor="dashboard-new-label">Create a global label</label><div><input id="dashboard-new-label" value={newName} maxLength={80} onChange={(event) => setNewName(event.target.value)} placeholder="Label name" /><button type="submit" disabled={!newName.trim() || Boolean(busy)}>{busy === 'create' ? 'Adding…' : 'Add label'}</button></div></form>
    {error && <p className="dashboard-label-error" role="alert">{error}</p>}
    <small className="dashboard-field-help">Label changes apply globally to synthetic Properties and Files. Drag or use arrows to set this record’s display order.</small>
  </div>
}
