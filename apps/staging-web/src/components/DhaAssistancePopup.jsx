import { useEffect, useRef, useState } from 'react'
import { useLocation } from '@tanstack/react-router'
import { ArrowLeft, ChevronRight, MessageCircle, Sparkles, X } from 'lucide-react'
import { PROBLEM_CATEGORIES } from '../../../../src/data/dhaAssistanceData.js'

const WHATSAPP_NUMBER = '923218446496'

export default function DhaAssistancePopup() {
  const { pathname } = useLocation()
  const isHomePage = pathname === '/'
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState(null)
  const [categories, setCategories] = useState([])
  const [categoryIndex, setCategoryIndex] = useState(0)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [completed, setCompleted] = useState(false)
  const timer = useRef(null)

  const clearTimer = () => { if (timer.current) window.clearTimeout(timer.current); timer.current = null }

  useEffect(() => {
    clearTimer()
    if (!isHomePage || window.__aiChatWidgetOpen || sessionStorage.getItem('dha_popup_disabled') === '1') { setOpen(false); return undefined }
    const shuffled = PROBLEM_CATEGORIES.filter((item) => !item.isCustom).sort(() => Math.random() - 0.5)
    setCategories(shuffled); setCategory(shuffled[0] || null); setCategoryIndex(0)
    const closeForChat = () => { clearTimer(); setOpen(false); try { sessionStorage.setItem('dha_popup_disabled', '1') } catch {} }
    const schedule = (delay) => { clearTimer(); timer.current = window.setTimeout(() => { if (!window.__aiChatWidgetOpen && sessionStorage.getItem('dha_popup_disabled') !== '1') setOpen(true) }, delay) }
    window.addEventListener('ai-chat-opened', closeForChat)
    if (!window.__globalPopupPending && !window.__globalPopupOpen) schedule(30000)
    return () => { clearTimer(); window.removeEventListener('ai-chat-opened', closeForChat) }
  }, [isHomePage])

  if (!isHomePage || !category || (!open && !completed)) return null
  const question = category.questions[step]
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(category.generateMessage(answers))}`
  function close() {
    setOpen(false); setStep(0); setAnswers({}); setCompleted(false)
    const next = categoryIndex + 1
    if (next >= categories.length) return
    setCategoryIndex(next); setCategory(categories[next]); timer.current = window.setTimeout(() => setOpen(true), next === 1 ? 60000 : next === 2 ? 90000 : 120000)
  }
  function choose(option) { const nextAnswers = { ...answers, [question.id]: option }; setAnswers(nextAnswers); if (step < category.questions.length - 1) setStep(step + 1); else setCompleted(true) }
  function reset() { setStep(0); setAnswers({}); setCompleted(false) }

  return <div className="dha-assistance-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close() }}>
    <section className="dha-assistance-dialog" role="dialog" aria-modal="true" aria-labelledby="dha-assistance-title" data-lenis-prevent>
      <button type="button" className="dha-assistance-close" onClick={close} aria-label="Close assistance popup"><X size={18} /></button>
      <div className="dha-assistance-header"><span className="dha-assistance-icon"><Sparkles size={16} /></span><span>Property Assistant</span></div>
      <h2 id="dha-assistance-title">{completed ? 'Got it. We have the details.' : category.title}</h2>
      <p className="dha-assistance-description">{completed ? 'Would you like to discuss this with our property team?' : `Question ${step + 1} of ${category.questions.length}`}</p>
      {!completed && question && <div className="dha-assistance-question"><h3>{question.question}</h3><div className="dha-assistance-options">{question.options.map((option) => <button type="button" key={option} onClick={() => choose(option)}>{option}<ChevronRight size={16} /></button>)}</div>{step > 0 && <button type="button" className="dha-assistance-previous" onClick={() => setStep(step - 1)}><ArrowLeft size={13} /> Previous question</button>}</div>}
      {completed && <div className="dha-assistance-complete"><span className="dha-assistance-whatsapp"><MessageCircle size={30} /></span><p>We have everything we need to understand your requirement. Continue on WhatsApp with an expert.</p><a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={close}><MessageCircle size={18} /> Continue on WhatsApp</a><button type="button" onClick={reset}>Start over / Change answers</button></div>}
    </section>
  </div>
}
