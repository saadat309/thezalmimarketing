import { useEffect, useRef, useState } from 'react'
import { ArrowUp, MessageCircle } from 'lucide-react'

const WHATSAPP_URL = 'https://wa.me/923218446496?text=Hi%2C%20I%20want%20to%20know%20about%20your%20real%20estate%20services.'

export default function StagingFloatingWidgets() {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [progress, setProgress] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const drag = useRef({ active: false, moved: false, suppressClick: false, originX: 0, originY: 0 })

  useEffect(() => {
    const update = () => {
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      setProgress(max ? Math.min(100, Math.max(0, (scrollTop / max) * 100)) : 0)
      setShowScrollTop(scrollTop > window.innerHeight * 0.8)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const radius = 20
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (progress / 100) * circumference

  function pointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    drag.current = { active: true, moved: false, suppressClick: false, originX: event.clientX - position.x, originY: event.clientY - position.y }
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }
  function pointerMove(event) {
    if (!drag.current.active) return
    const next = { x: event.clientX - drag.current.originX, y: event.clientY - drag.current.originY }
    if (Math.hypot(next.x - position.x, next.y - position.y) > 6) drag.current.moved = true
    setPosition(next)
  }
  function pointerUp(event) {
    drag.current.active = false
    drag.current.suppressClick = drag.current.moved
    drag.current.moved = false
    if (drag.current.suppressClick) window.setTimeout(() => { drag.current.suppressClick = false }, 0)
    try { event.currentTarget.releasePointerCapture?.(event.pointerId) } catch {}
  }
  function stopIfDragged(event) {
    if (drag.current.suppressClick) { event.preventDefault(); event.stopPropagation() }
  }
  return <div className="staging-floating-widgets" aria-label="Quick actions" style={{ transform: `translate(${position.x}px,${position.y}px)` }} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp}>
    {showScrollTop && <button type="button" className="staging-scroll-top" onClick={(event) => { stopIfDragged(event); if (!event.defaultPrevented) window.scrollTo({ top: 0, behavior: 'smooth' }) }} aria-label="Scroll to top">
      <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r={radius} className="staging-scroll-track" /><circle cx="24" cy="24" r={radius} className="staging-scroll-progress" strokeDasharray={circumference} strokeDashoffset={dashOffset} /></svg>
      <ArrowUp aria-hidden="true" />
    </button>}
    <a className="staging-whatsapp-widget" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={stopIfDragged} aria-label="Chat on WhatsApp"><MessageCircle aria-hidden="true" /><span>Chat on WhatsApp</span></a>
  </div>
}
