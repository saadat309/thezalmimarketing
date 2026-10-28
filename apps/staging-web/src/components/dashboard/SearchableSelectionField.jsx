import { useMemo, useState } from 'react'
import { Check, ChevronsUpDown, GripVertical, Search, X } from 'lucide-react'

/** Searchable source-style selector with an ordered, keyboard-operable selection list. */
export default function SearchableSelectionField({
  label,
  id,
  options = [],
  value,
  onChange,
  multiple = false,
  placeholder = 'Select an option…',
  emptyMessage = 'No options found.',
  disabled = false,
  allowNone = false,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const values = multiple ? (Array.isArray(value) ? value.map(String) : []) : [String(value ?? '')]
  const selected = useMemo(() => values.map((id) => options.find((option) => String(option.value) === id)).filter(Boolean), [options, values.join('|')])
  const filtered = options.filter((option) => String(option.label).toLowerCase().includes(query.trim().toLowerCase()))

  function toggle(option) {
    const id = String(option.value)
    if (multiple) onChange(values.includes(id) ? values.filter((entry) => entry !== id) : [...values, id])
    else { onChange(id); setOpen(false); setQuery('') }
  }

  function reorder(fromId, toId) {
    if (!fromId || !toId || fromId === toId) return
    const next = [...values]
    const from = next.indexOf(fromId)
    const to = next.indexOf(toId)
    if (from < 0 || to < 0) return
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange(next)
  }

  function move(index, offset) {
    const nextIndex = index + offset
    if (nextIndex < 0 || nextIndex >= values.length) return
    reorder(values[index], values[nextIndex])
  }

  const currentLabel = selected[0]?.label
  return <div className={`dashboard-search-select${open ? ' is-open' : ''}`}>
    <button id={id} type="button" className="dashboard-search-select-trigger" role="combobox" aria-label={label} aria-expanded={open} disabled={disabled} onClick={() => { setOpen((current) => !current); setQuery('') }}>
      <span>{multiple ? `${selected.length} item${selected.length === 1 ? '' : 's'} selected` : currentLabel || placeholder}</span><ChevronsUpDown size={16} aria-hidden="true" />
    </button>
    {open && <div className="dashboard-search-select-popover">
      <label className="dashboard-search-select-search" htmlFor={`${id}-search`}><Search size={15} aria-hidden="true" /><span className="sr-only">Search {label}</span><input id={`${id}-search`} name={`${id}-search`} autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${label.toLowerCase()}…`} onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false) }} /></label>
      <div className="dashboard-search-select-options" role="listbox" aria-label={`${label} options`} aria-multiselectable={multiple || undefined}>
        {!multiple && allowNone && <button type="button" role="option" aria-selected={!values[0]} onClick={() => { onChange(''); setOpen(false) }}><Check size={15} aria-hidden="true" />None</button>}
        {filtered.map((option) => { const active = values.includes(String(option.value)); return <button key={option.value} type="button" role="option" aria-selected={active} onClick={() => toggle(option)}><Check className={active ? '' : 'is-hidden'} size={15} aria-hidden="true" />{option.label}</button> })}
        {!filtered.length && <p className="dashboard-field-help">{emptyMessage}</p>}
      </div>
      {multiple && <button type="button" className="dashboard-search-select-done" onClick={() => setOpen(false)}>Done</button>}
    </div>}
    {multiple && <div className="dashboard-sortable-selection" aria-label={`Selected ${label}`}>
      {selected.length ? selected.map((option, index) => <div className="dashboard-sortable-selection-row" key={option.value} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); reorder(event.dataTransfer.getData('text/plain'), String(option.value)) }}>
        <button className="dashboard-sort-handle" type="button" draggable aria-label={`Drag ${option.label} to reorder`} onDragStart={(event) => { event.dataTransfer.setData('text/plain', String(option.value)); event.dataTransfer.effectAllowed = 'move' }}><GripVertical size={16} aria-hidden="true" /></button><span>{option.label}</span>
        <div className="dashboard-sort-actions"><button type="button" aria-label={`Move ${option.label} up`} disabled={index === 0} onClick={() => move(index, -1)}>↑</button><button type="button" aria-label={`Move ${option.label} down`} disabled={index === selected.length - 1} onClick={() => move(index, 1)}>↓</button><button type="button" aria-label={`Remove ${option.label}`} onClick={() => onChange(values.filter((entry) => entry !== String(option.value)))}><X size={14} aria-hidden="true" /></button></div>
      </div>) : <p className="dashboard-field-help">No items selected.</p>}
    </div>}
  </div>
}
