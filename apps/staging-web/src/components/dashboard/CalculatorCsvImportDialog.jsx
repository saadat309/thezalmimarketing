import { useState } from 'react'
import { Download, Loader2, Upload, X } from 'lucide-react'
import { calculatorCsvAction } from '../../data/admin-api.js'

export default function CalculatorCsvImportDialog({ domain, onClose, onSuccess }) {
  const [file, setFile] = useState(null)
  const [validation, setValidation] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const isRates = domain === 'calculator-rates'
  const title = isRates ? 'Import Calculator Rates' : 'Import Calculator Transfer Fees'

  async function downloadTemplate() {
    setBusy(true); setError('')
    try { await calculatorCsvAction(domain, 'template') } catch (caught) { setError(caught.message) } finally { setBusy(false) }
  }

  async function validateFile() {
    if (!file) return setError('Please select a CSV file first.')
    setBusy(true); setError('')
    try { setValidation(await calculatorCsvAction(domain, 'import', { file, validateOnly: true })) }
    catch (caught) { setError(caught.message) }
    finally { setBusy(false) }
  }

  async function importValidRows() {
    if (!file) return
    setBusy(true); setError('')
    try {
      const result = await calculatorCsvAction(domain, 'import', { file })
      await onSuccess?.(result)
      onClose()
      return result
    } catch (caught) { setError(caught.message) }
    finally { setBusy(false) }
  }

  return <div className="dashboard-import-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose() }}>
    <section className="dashboard-import-dialog" role="dialog" aria-modal="true" aria-labelledby="calculator-csv-title">
      <header><div><h3 id="calculator-csv-title">{title}</h3><p>{isRates
        ? 'Upload a CSV of DC/FBR valuation rates. City, society, and property type must match the existing synthetic data; missing phases and blocks are created during import.'
        : 'Upload reference transfer fees. City, society, phase, and any selected block must already exist in the synthetic data.'}</p></div>
        <button type="button" aria-label="Close import dialog" disabled={busy} onClick={onClose}><X size={18} /></button></header>
      <div className="dashboard-import-content">
        {error && <div className="dashboard-alert" role="alert">{error}</div>}
        <div className="dashboard-import-template"><div><strong>Download Sample Template</strong><span>CSV template populated with clearly synthetic calculator examples.</span></div><button className="dashboard-outline-button" type="button" disabled={busy} onClick={downloadTemplate}><Download size={15} aria-hidden="true" />Download Sample CSV</button></div>
        <label className="dashboard-import-file">Select CSV File (.csv)<input type="file" accept=".csv,text/csv" disabled={busy} onChange={(event) => { setFile(event.target.files?.[0] || null); setValidation(null); setError('') }} /></label>
        {file && !validation && <div className="dashboard-import-actions"><span>{file.name}</span><button className="dashboard-primary-button" type="button" disabled={busy} onClick={validateFile}>{busy ? <Loader2 className="dashboard-import-loading" size={15} /> : <Upload size={15} />}Validate File</button></div>}
        {validation && <div className="dashboard-import-summary">
          <h4>Validation Summary</h4><div className="dashboard-import-counts"><span>Total: <b>{validation.total_rows}</b></span><span>Valid: <b>{validation.valid_rows}</b></span><span>Invalid: <b>{validation.invalid_rows}</b></span><span>Duplicates: <b>{validation.duplicate_rows}</b></span></div>
          <div className="dashboard-import-rows">{validation.details.map((row) => <article key={row.row} className={row.is_valid ? 'is-valid' : 'is-invalid'}>
            <strong>Row {row.row}: {[row.city, row.society, row.phase, row.block && `(${row.block})`, isRates ? row.property_type : row.category].filter(Boolean).join(' > ')}</strong><span>{row.is_valid ? 'Valid' : 'Invalid'}</span>
            {row.errors.length > 0 && <ul>{row.errors.map((message, index) => <li key={`${row.row}-${index}`}>{message}</li>)}</ul>}
          </article>)}</div>
          <button className="dashboard-primary-button dashboard-import-submit" type="button" disabled={busy || validation.valid_rows === 0} onClick={importValidRows}>{busy ? <Loader2 className="dashboard-import-loading" size={15} /> : <Upload size={15} />}Import Valid Rows ({validation.valid_rows})</button>
        </div>}
      </div>
      <footer><button className="dashboard-outline-button" type="button" disabled={busy} onClick={onClose}>Cancel</button></footer>
    </section>
  </div>
}
