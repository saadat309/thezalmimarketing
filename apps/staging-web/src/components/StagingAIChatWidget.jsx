import { useEffect, useRef, useState } from 'react'
import { Bot, LoaderCircle, Send, Sparkles, X } from 'lucide-react'

const AI_URL = import.meta.env.VITE_AI_API_URL || ''
const SUGGESTIONS = ['Tell me about DHA properties', 'How do transfer expenses work?', 'Where can I find society maps?']

export default function StagingAIChatWidget() {
  const [open, setOpen] = useState(false)
  const [attention, setAttention] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Assalam-o-Alaikum! I am the Zalmi Marketing AI Assistant. How can I help with properties, plot files, maps, or transfer expenses?' }])
  const drag = useRef({ active: false, moved: false, suppressClick: false, originX: 0, originY: 0 })
  const widgetRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const closeOnOutsidePointer = (event) => {
      if (!widgetRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsidePointer)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer)
  }, [open])

  useEffect(() => {
    const onScroll = () => setAttention(window.scrollY > 350 && !hasOpened && !open)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [hasOpened, open])

  useEffect(() => {
    window.__aiChatWidgetOpen = open
    window.dispatchEvent(new CustomEvent(open ? 'ai-chat-opened' : 'ai-chat-closed'))
    return () => { window.__aiChatWidgetOpen = false }
  }, [open])

  function pointerDown(event) {
    if (open || (event.pointerType === 'mouse' && event.button !== 0)) return
    drag.current = { active: true, moved: false, suppressClick: false, originX: event.clientX - position.x, originY: event.clientY - position.y }
    event.target.setPointerCapture?.(event.pointerId)
  }
  function pointerMove(event) {
    if (!drag.current.active || open) return
    const next = { x: event.clientX - drag.current.originX, y: event.clientY - drag.current.originY }
    if (Math.hypot(next.x - position.x, next.y - position.y) > 6) drag.current.moved = true
    setPosition(next)
  }
  function pointerUp(event) {
    drag.current.active = false
    drag.current.suppressClick = drag.current.moved
    drag.current.moved = false
    if (drag.current.suppressClick) window.setTimeout(() => { drag.current.suppressClick = false }, 0)
    event.target.releasePointerCapture?.(event.pointerId)
  }
  function toggle() {
    if (drag.current.suppressClick) return
    setOpen((value) => !value); setHasOpened(true); setAttention(false)
  }
  function openChat(event) {
    event.stopPropagation()
    if (drag.current.suppressClick) return
    setOpen(true); setHasOpened(true); setAttention(false)
  }
  function closeChat(event) {
    event.stopPropagation()
    setOpen(false)
  }
  async function send(text = input) {
    const value = text.trim()
    if (!value || loading) return
    const nextMessages = [...messages, { role: 'user', content: value }]
    setMessages(nextMessages); setInput(''); setLoading(true)
    try {
      if (!AI_URL) throw new Error('AI endpoint is not configured for this environment.')
      const response = await fetch(AI_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ messages: nextMessages }) })
      if (!response.ok) throw new Error(`AI service returned ${response.status}`)
      const data = await response.json()
      setMessages((current) => [...current, { role: 'assistant', content: data.response || 'I could not produce a response. Please try again.' }])
    } catch {
      setMessages((current) => [...current, { role: 'assistant', content: 'The AI assistant is not connected in this environment yet. Please use the website pages or WhatsApp button for assistance.' }])
    } finally { setLoading(false) }
  }

  return <div ref={widgetRef} className={`staging-ai-widget ${open ? 'is-open' : ''}`} style={!open ? { transform: `translate(${position.x}px,${position.y}px)` } : undefined} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp}>
    {!open ? <div className="staging-ai-launch-wrap">
      {attention && <div className="staging-ai-attention"><button type="button" aria-label="Dismiss AI assistant message" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); setAttention(false); setHasOpened(true) }}><X size={15} /></button><div className="staging-ai-attention-head"><span><Bot size={17} /></span><div><strong>AI Assistant</strong><small>Active now · Ready to help</small></div></div><p>Looking for property, DHA investment information, or transfer tools? I’m here to guide you.</p><button type="button" onClick={openChat}><Sparkles size={14} /> Start Live Chat</button></div>}
      <button type="button" className="staging-ai-launch" aria-label="Open AI Assistant" onClick={openChat}><Bot aria-hidden="true" /><i aria-hidden="true" /></button>
    </div> : <section className="staging-ai-panel" role="dialog" aria-modal="false" aria-labelledby="staging-ai-title" data-lenis-prevent>
      <header><div className="staging-ai-title"><span><Bot size={20} /></span><div><h2 id="staging-ai-title">AI Assistant</h2><small>Business Concierge</small></div></div><button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={closeChat} aria-label="Close AI chat"><X size={18} /></button></header>
      <div className="staging-ai-messages">{messages.map((message, index) => <p key={`${message.role}-${index}`} className={`staging-ai-message ${message.role}`}>{message.content}</p>)}{messages.length === 1 && <div className="staging-ai-suggestions">{SUGGESTIONS.map((suggestion) => <button type="button" key={suggestion} onClick={() => send(suggestion)}>{suggestion}</button>)}</div>}{loading && <p className="staging-ai-message assistant"><LoaderCircle className="staging-ai-spinner" size={15} /> AI Assistant is thinking...</p>}</div>
      <form className="staging-ai-input" onSubmit={(event) => { event.preventDefault(); send() }}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about Zalmi Marketing..." disabled={loading} /><button type="submit" aria-label="Send message" disabled={loading || !input.trim()}>{loading ? <LoaderCircle className="staging-ai-spinner" size={17} /> : <Send size={17} />}</button></form>
    </section>}
  </div>
}
