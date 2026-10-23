import { useEffect, useRef } from 'react'
import { Bold, Eraser, Heading, Italic, Link, List, ListOrdered, Minus, Quote, Redo2, Underline, Undo2 } from 'lucide-react'

const actions = [
  { label: 'Heading 2', icon: Heading, command: 'formatBlock', value: 'h2' },
  { label: 'Bold', icon: Bold, command: 'bold' },
  { label: 'Italic', icon: Italic, command: 'italic' },
  { label: 'Underline', icon: Underline, command: 'underline' },
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

  return <div className="dashboard-rich-text-editor">
    <div className="dashboard-rich-text-toolbar" role="toolbar" aria-label="Detailed description formatting">
      {actions.map(({ label, icon: Icon, command, value: commandValue }) => <button key={label} type="button" aria-label={label} title={label} onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand(command, commandValue)}><Icon size={15} aria-hidden="true" /></button>)}
      <button type="button" aria-label="Insert link" title="Insert link" onMouseDown={(event) => event.preventDefault()} onClick={addLink}><Link size={15} aria-hidden="true" /></button>
      <button type="button" aria-label="Horizontal rule" title="Horizontal rule" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand('insertHorizontalRule')}><Minus size={15} aria-hidden="true" /></button>
    </div>
    <div id={id} ref={editorRef} className="dashboard-rich-text-content" contentEditable role="textbox" aria-multiline="true" aria-label="Detailed Description Content" data-placeholder={placeholder} suppressContentEditableWarning onInput={(event) => onChange(event.currentTarget.innerHTML)} />
  </div>
}
