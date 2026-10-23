import { useEffect, useRef } from 'react'
import { Bold, Eraser, Italic, Link, List, ListOrdered, Minus, Quote, Redo2, Strikethrough, Underline, Undo2 } from 'lucide-react'

const actions = [
  { label: 'Bold', icon: Bold, command: 'bold' },
  { label: 'Italic', icon: Italic, command: 'italic' },
  { label: 'Underline', icon: Underline, command: 'underline' },
  { label: 'Strikethrough', icon: Strikethrough, command: 'strikeThrough' },
  { label: 'Block quote', icon: Quote, command: 'formatBlock', value: 'blockquote' },
  { label: 'Bulleted list', icon: List, command: 'insertUnorderedList' },
  { label: 'Numbered list', icon: ListOrdered, command: 'insertOrderedList' },
  { label: 'Undo', icon: Undo2, command: 'undo' },
  { label: 'Redo', icon: Redo2, command: 'redo' },
  { label: 'Clear formatting', icon: Eraser, command: 'removeFormat' },
]

function isSafeLink(value) {
  try {
    const base = 'https://migration.local.invalid'
    const parsed = new URL(value, base)
    return (parsed.origin === base && !value.startsWith('//')) || /^https:\/\//i.test(value)
  } catch {
    return false
  }
}

function sanitizeEditorHtml(html) {
  if (typeof DOMParser === 'undefined' || typeof html !== 'string') return html || ''
  const allowed = new Set(['p', 'br', 'strong', 'em', 'u', 's', 'blockquote', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'hr'])
  const dropped = new Set(['script', 'style', 'iframe', 'object', 'embed', 'svg', 'math', 'form', 'template'])
  const document = new DOMParser().parseFromString(html, 'text/html')
  for (const element of [...document.body.querySelectorAll('*')].reverse()) {
    const tag = element.tagName.toLowerCase()
    if (dropped.has(tag)) {
      element.remove()
      continue
    }
    if (!allowed.has(tag)) {
      element.replaceWith(...element.childNodes)
      continue
    }
    for (const attribute of [...element.attributes]) {
      if (tag !== 'a' || attribute.name.toLowerCase() !== 'href' || !isSafeLink(attribute.value)) element.removeAttribute(attribute.name)
    }
  }
  return document.body.innerHTML
}

export default function RichTextEditor({ id, value, onChange, placeholder }) {
  const editorRef = useRef(null)

  useEffect(() => {
    const safeValue = sanitizeEditorHtml(value || '')
    if (editorRef.current && editorRef.current.innerHTML !== safeValue) editorRef.current.innerHTML = safeValue
  }, [value])

  function runCommand(command, commandValue) {
    editorRef.current?.focus()
    document.execCommand(command, false, commandValue)
    onChange(sanitizeEditorHtml(editorRef.current?.innerHTML || ''))
  }

  function addLink() {
    editorRef.current?.focus()
    const url = window.prompt('Enter a URL')
    if (!url) return
    if (!isSafeLink(url.trim())) {
      window.alert('Use a relative path or an https:// URL.')
      return
    }
    document.execCommand('createLink', false, url.trim())
    onChange(sanitizeEditorHtml(editorRef.current?.innerHTML || ''))
  }

  function applyFormat(command, commandValue) {
    editorRef.current?.focus()
    document.execCommand(command, false, commandValue)
    onChange(sanitizeEditorHtml(editorRef.current?.innerHTML || ''))
  }

  return <div className="dashboard-rich-text-editor">
    <div className="dashboard-rich-text-toolbar" role="toolbar" aria-label="Detailed description formatting">
      <label className="dashboard-rich-text-select-label" htmlFor={`${id}-heading`}>Heading level
        <select id={`${id}-heading`} defaultValue="p" onChange={(event) => applyFormat('formatBlock', event.target.value)}>
          <option value="p">Normal</option><option value="h1">Heading 1</option><option value="h2">Heading 2</option><option value="h3">Heading 3</option><option value="h4">Heading 4</option><option value="h5">Heading 5</option><option value="h6">Heading 6</option>
        </select>
      </label>
      <label className="dashboard-rich-text-select-label" htmlFor={`${id}-size`}>Text size
        <select id={`${id}-size`} defaultValue="3" onChange={(event) => applyFormat('fontSize', event.target.value)}>
          <option value="2">Small</option><option value="3">Normal</option><option value="4">Large</option><option value="5">Extra large</option>
        </select>
      </label>
      {actions.map(({ label, icon: Icon, command, value: commandValue }) => <button key={label} type="button" aria-label={label} title={label} onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand(command, commandValue)}><Icon size={15} aria-hidden="true" /></button>)}
      <button type="button" aria-label="Decrease indent" title="Decrease indent" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand('outdent')}><Minus size={15} aria-hidden="true" /></button>
      <button type="button" aria-label="Increase indent" title="Increase indent" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand('indent')}><span aria-hidden="true">↦</span></button>
      <button type="button" aria-label="Insert link" title="Insert link" onMouseDown={(event) => event.preventDefault()} onClick={addLink}><Link size={15} aria-hidden="true" /></button>
      <button type="button" aria-label="Horizontal rule" title="Horizontal rule" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand('insertHorizontalRule')}><Minus size={15} aria-hidden="true" /></button>
    </div>
    <div id={id} ref={editorRef} className="dashboard-rich-text-content" contentEditable role="textbox" aria-multiline="true" aria-label="Detailed Description Content" data-placeholder={placeholder} suppressContentEditableWarning onInput={(event) => onChange(sanitizeEditorHtml(event.currentTarget.innerHTML))} />
  </div>
}
