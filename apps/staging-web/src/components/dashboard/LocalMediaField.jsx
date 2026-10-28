import { useEffect, useMemo, useRef, useState } from 'react'
import { FileImage, FileText, Film, Trash2, Upload } from 'lucide-react'
import { readAdminMedia, removeAdminMedia, uploadAdminMedia } from '../../data/admin-api.js'

const MEDIA_OPTIONS = {
  property: [{ kind: 'image', label: 'Image', accept: 'image/jpeg,image/png,image/webp' }, { kind: 'video', label: 'Video', accept: 'video/mp4,video/webm' }],
  file: [{ kind: 'image', label: 'Image', accept: 'image/jpeg,image/png,image/webp' }],
  map: [{ kind: 'image', label: 'Map image', accept: 'image/jpeg,image/png,image/webp' }, { kind: 'pdf', label: 'Map PDF', accept: 'application/pdf' }],
  category: [{ kind: 'image', label: 'Category image', accept: 'image/jpeg,image/png,image/webp' }],
}

export default function LocalMediaField({ ownerType, ownerId }) {
  const inputRef = useRef(null)
  const options = MEDIA_OPTIONS[ownerType] || []
  const [kind, setKind] = useState(options[0]?.kind || 'image')
  const [items, setItems] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const selectedOption = useMemo(() => options.find((option) => option.kind === kind) || options[0], [kind, options])

  async function refresh() {
    if (!ownerId) return
    try { setItems((await readAdminMedia(ownerType, ownerId)).items || []) } catch (caught) { setError(caught.message) }
  }
  useEffect(() => { setItems([]); setError(''); refresh() }, [ownerType, ownerId])

  async function upload(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !selectedOption) return
    setBusy(true); setError('')
    try { await uploadAdminMedia({ ownerType, ownerId, kind: selectedOption.kind, file }); await refresh() }
    catch (caught) { setError(caught.message) }
    finally { setBusy(false) }
  }

  async function remove(id) {
    setBusy(true); setError('')
    try { await removeAdminMedia(id); await refresh() }
    catch (caught) { setError(caught.message) }
    finally { setBusy(false) }
  }

  if (!ownerId) return <div className="dashboard-media-placeholder"><strong>Local media test</strong><span>Save this synthetic record first, then local-only media can be selected and removed.</span></div>
  return <div className="dashboard-media-placeholder"><strong>Local media test</strong><span>Files stay in the loopback staging Worker memory only. Nothing is sent to R2, production, or an external service.</span>
    <div className="dashboard-media-local-controls"><label htmlFor={`media-kind-${ownerType}-${ownerId}`}>Media type</label><select id={`media-kind-${ownerType}-${ownerId}`} value={kind} onChange={(event) => setKind(event.target.value)} disabled={busy}>{options.map((option) => <option key={option.kind} value={option.kind}>{option.label}</option>)}</select><input ref={inputRef} type="file" accept={selectedOption?.accept} onChange={upload} disabled={busy} aria-label={`Choose ${selectedOption?.label || 'media'} file`} /><button type="button" onClick={() => inputRef.current?.click()} disabled={busy}><Upload size={15} aria-hidden="true" />{busy ? 'Working…' : 'Choose local file'}</button></div>
    {error && <p className="dashboard-label-error" role="alert">{error}</p>}
    {items.length > 0 && <ul className="dashboard-local-media-list">{items.map((item) => <li key={item.id}><span>{item.kind === 'image' ? <FileImage size={15} aria-hidden="true" /> : item.kind === 'pdf' ? <FileText size={15} aria-hidden="true" /> : <Film size={15} aria-hidden="true" />}<span>{item.filename} · {item.contentType} · {item.size} bytes</span></span><button type="button" aria-label={`Remove ${item.filename}`} onClick={() => remove(item.id)} disabled={busy}><Trash2 size={14} aria-hidden="true" /></button></li>)}</ul>}
  </div>
}
