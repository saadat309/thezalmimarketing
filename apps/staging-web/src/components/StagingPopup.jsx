import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

let shownThisLoad = false

export default function StagingPopup({ isVisible = false, delayMs = 8000, title = '', description = '', mediaType = 'image', mediaPath = '' }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!isVisible || shownThisLoad) return undefined
    const timer = window.setTimeout(() => {
      shownThisLoad = true
      setOpen(true)
    }, Math.max(0, Number(delayMs) || 0))
    return () => window.clearTimeout(timer)
  }, [isVisible, delayMs])

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  if (!open) return null
  return <div className="staging-popup-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false) }}>
    <section className="staging-popup" role="dialog" aria-modal="true" aria-labelledby="staging-popup-title" aria-describedby={description ? 'staging-popup-description' : undefined}>
      <button type="button" className="staging-popup-close" aria-label="Close popup" onClick={() => setOpen(false)}><X aria-hidden="true" /></button>
      {mediaPath && mediaType === 'image' && <img className="staging-popup-media" src={mediaPath} alt={title || 'Featured announcement'} />}
      {mediaPath && mediaType === 'embed' && <iframe className="staging-popup-media" src={mediaPath} title={title || 'Featured announcement'} loading="lazy" allowFullScreen />}
      {(title || description) && <div className="staging-popup-copy">{title && <h2 id="staging-popup-title">{title}</h2>}{description && <p id="staging-popup-description">{description}</p>}</div>}
    </section>
  </div>
}
