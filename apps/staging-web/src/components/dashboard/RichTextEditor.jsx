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

export default function RichTextEditor({ id, value, onChange, placeholder }) {
  const editorRef = useRef(null)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (value || '')) editorRef.current.innerHTML = value || ''
  }, [value])

  function runCommand(command, commandValue) {
    editorRef.current?.focus()
    document.execCommand(command, false, commandValue)
    onChange(editorRef.current?.innerHTML || '')
  }

  function addLink() {
    editorRef.current?.focus()
    const url = window.prompt('Enter a URL')
    if (!url) return
    document.execCommand('createLink', false, url)
    onChange(editorRef.current?.innerHTML || '')
  }

  function applyFormat(command, commandValue) {
    editorRef.current?.focus()
    document.execCommand(command, false, commandValue)
    onChange(editorRef.current?.innerHTML || '')
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
    <div id={id} ref={editorRef} className="dashboard-rich-text-content" contentEditable role="textbox" aria-multiline="true" aria-label="Detailed Description Content" data-placeholder={placeholder} suppressContentEditableWarning onInput={(event) => onChange(event.currentTarget.innerHTML)} />
  </div>
}
