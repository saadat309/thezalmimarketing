import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { readAdminCollection, updateAdminRecord } from '../../data/admin-api.js'
import SearchableSelectionField from './SearchableSelectionField.jsx'

const SOURCE_FOR = { properties: 'properties', categories: 'categories', maps: 'maps', files: 'files' }
const itemKey = (item) => String(item.source_id ?? item.id)

export default function LandingPageWorkspace() {
  const [sections, setSections] = useState(null)
  const [choices, setChoices] = useState({})
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([
      readAdminCollection('landing-page'),
      ...Object.keys(SOURCE_FOR).map(readAdminCollection),
    ]).then(([landing, ...collections]) => {
      if (!active) return
      const nextChoices = Object.fromEntries(Object.keys(SOURCE_FOR).map((domain, index) => [domain, collections[index].items.filter((item) => item.hide !== true && item.active !== false)]))
      const validByCollection = Object.fromEntries(Object.entries(nextChoices).map(([domain, items]) => [domain, new Set(items.map(itemKey))]))
      setSections(landing.items.map((section) => ({ ...section, selectedItems: (section.selectedItems || []).filter((id) => validByCollection[section.collection]?.has(String(id))) })))
      setChoices(nextChoices)
    }).catch((caught) => { if (active) setError(caught.message) })
    return () => { active = false }
  }, [])

  function patchSection(id, patch) {
    setSections((current) => current.map((section) => section.id === id ? { ...section, ...patch } : section))
    setNotice('')
  }

  async function save() {
    setBusy(true); setError(''); setNotice('')
    try {
      await Promise.all(sections.map(({ id, title, subtitle, active, selectedItems, mediaUrl, delayMs }) =>
        updateAdminRecord('landing-page', id, { title, subtitle, active, selectedItems, mediaUrl, delayMs })))
      setNotice('Landing page settings saved to the local synthetic API.')
    } catch (caught) { setError(caught.message) } finally { setBusy(false) }
  }

  if (!sections) return <section className="dashboard-data-page"><div className="dashboard-loading" role="status"><span className="dashboard-spinner" />Loading landing page settings…</div>{error && <div className="dashboard-alert" role="alert">{error}</div>}</section>

  return <section className="dashboard-data-page landing-workspace">
    {error && <div className="dashboard-alert" role="alert"><span>{error}</span><button type="button" aria-label="Dismiss error" onClick={() => setError('')}><X size={16} /></button></div>}
    {notice && <div className="landing-success" role="status">{notice}</div>}
    <div className="dashboard-data-heading"><div><h2>Landing Page Configuration</h2><p>Edit section content and visibility. Display order is fixed.</p></div><button type="button" className="dashboard-primary-button" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save Changes'}</button></div>
    <div className="landing-storage-note"><strong>Media uploads are paused</strong><span>Image/video upload controls will be enabled when the staging storage binding is approved. This page never uploads files.</span></div>
      <div className="landing-section-list">{sections.map((section, index) => {
      const options = choices[section.collection] || []
      const selectorOptions = options.map((item) => ({ value: itemKey(item), label: item.title || item.name || itemKey(item) }))
      return <article className="landing-section-card" key={section.id}>
        <header className="landing-section-header"><div className="landing-section-position">{String(index + 1).padStart(2, '0')}</div><div className="landing-section-heading"><h3>{section.sectionName}</h3><p>{section.collection === 'popup' ? 'Timed promotional popup' : section.collection === 'video' ? 'Homepage video block' : `Homepage ${section.collection} collection`}</p></div><label className="landing-switch"><input type="checkbox" checked={section.active} onChange={(event) => patchSection(section.id, { active: event.target.checked })} /><span>{section.active ? 'Enabled' : 'Disabled'}</span></label></header>
        <div className="landing-section-body">
          <div className="landing-config-grid"><label>Heading<input value={section.title} onChange={(event) => patchSection(section.id, { title: event.target.value })} /></label><label>Subheading<textarea rows="2" value={section.subtitle} onChange={(event) => patchSection(section.id, { subtitle: event.target.value })} /></label></div>
          {['popup', 'video'].includes(section.collection) ? <div className="landing-media-config">
            {section.collection === 'popup' && <label>Display delay (ms)<input type="number" min="0" max="60000" value={section.delayMs} onChange={(event) => patchSection(section.id, { delayMs: Math.min(60000, Math.max(0, Number(event.target.value))) })} /></label>}
            {section.mediaMode === 'embed' && <label>{section.collection === 'popup' ? 'YouTube/Vimeo URL' : 'Video embed URL'}<input type="url" placeholder="https://…" value={section.mediaUrl} onChange={(event) => patchSection(section.id, { mediaUrl: event.target.value })} /></label>}
            {section.mediaMode === 'upload' && <p className="landing-upload-placeholder">Uploads are disabled in this local migration preview; no files are accepted or stored.</p>}
          </div> : <div className="landing-items-config"><div className="landing-items-title"><div><h4>Available Items</h4><p>Select items and arrange their display order.</p></div><span>{(section.selectedItems || []).length} selected</span></div><SearchableSelectionField id={`landing-${section.id}-items`} label={`${section.collection} items`} options={selectorOptions} value={section.selectedItems || []} onChange={(selectedItems) => patchSection(section.id, { selectedItems })} multiple placeholder={`Select ${section.collection}…`} emptyMessage={options.length ? 'No matching items.' : `No public synthetic ${section.collection} records available.`} disabled={busy} /></div>}
        </div>
      </article>
    })}</div>
    <div className="landing-bottom-save"><span>Content and visibility are stored in local synthetic D1. Media uploads remain disabled.</span><button type="button" className="dashboard-primary-button" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save Changes'}</button></div>
  </section>
}
