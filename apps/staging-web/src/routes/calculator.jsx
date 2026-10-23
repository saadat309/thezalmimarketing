import { useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { AlertCircle, ArrowLeft, ArrowRight, Building2, Calculator, CheckCircle2, Download, FileCode, Image as ImageIcon, MapPin, Printer, RefreshCw, Trash2 } from 'lucide-react'
import { readStagingCalculatorConfig } from '../data/directory-api.js'
import { calculateStagingEstimate } from '../data/calculator.js'
import calculatorContent from '@/content/pages/calculator.json'

export const Route = createFileRoute('/calculator')({
  loader: () => readStagingCalculatorConfig(),
  head: () => ({
    meta: [
      { title: calculatorContent.seo.title },
      { name: 'description', content: calculatorContent.seo.description },
      { name: 'keywords', content: calculatorContent.seo.keywords },
      { name: 'robots', content: 'noindex, nofollow' },
      { property: 'og:type', content: calculatorContent.seo.ogType },
      { property: 'og:title', content: calculatorContent.seo.ogTitle },
      { property: 'og:description', content: calculatorContent.seo.ogDescription },
    ],
    links: [{ rel: 'canonical', href: 'https://migration.local.invalid/calculator' }],
  }),
  errorComponent: CalculatorUnavailable,
  component: CalculatorPage,
})

const money = (value) => `Rs. ${Math.round(Number(value) || 0).toLocaleString('en-PK')}`
const toNumber = (value) => Number.parseFloat(value) || 0

function CalculatorPage() {
  const config = Route.useLoaderData()
  const [step, setStep] = useState(1)
  const [showResults, setShowResults] = useState(false)
  const [cityId, setCityId] = useState('')
  const [societyId, setSocietyId] = useState('')
  const [phaseId, setPhaseId] = useState('')
  const [blockId, setBlockId] = useState('')
  const [payer, setPayer] = useState('Purchaser')
  const [category, setCategory] = useState('Residential')
  const [propertyTypeId, setPropertyTypeId] = useState('')
  const [size, setSize] = useState('5')
  const [unit, setUnit] = useState('Marla')
  const [coveredArea, setCoveredArea] = useState('')
  const [transferType, setTransferType] = useState('Regular')
  const [owners, setOwners] = useState('1')
  const [taxpayer, setTaxpayer] = useState('Filer')
  const [verification, setVerification] = useState('Required')
  const [bianaIncluded, setBianaIncluded] = useState('Included')
  const [agreementType, setAgreementType] = useState('Simple')
  const [stampDutyPayment, setStampDutyPayment] = useState('Online')
  const [customDcRate, setCustomDcRate] = useState('')
  const [customFbrRate, setCustomFbrRate] = useState('')
  const [overrides, setOverrides] = useState({})
  const [deletedLines, setDeletedLines] = useState([])
  const [customExpenses, setCustomExpenses] = useState([])
  const [customLabel, setCustomLabel] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [exportOpen, setExportOpen] = useState(false)
  const [message, setMessage] = useState('')

  const propertyType = config.calculator_property_types.find((item) => String(item.id) === propertyTypeId)
  const propertyName = propertyType?.property_type || ''
  const usesCoveredArea = ['House', 'Appartment', 'Plaza/Building', 'Shop'].includes(propertyName)
  const marlaSize = unit === 'Kanal' ? toNumber(size) * 20 : unit === 'Sq. Yards' ? toNumber(size) / 27.225 : toNumber(size)
  const availableSocieties = useMemo(() => {
    const ids = new Set(config.calculator_phases.filter((item) => item.is_active !== false && item.is_active !== 0 && String(item.city_id) === cityId).map((item) => String(item.society_id)))
    return config.societies.filter((item) => ids.has(String(item.id)))
  }, [config, cityId])
  const availablePhases = config.calculator_phases.filter((item) => item.is_active !== false && item.is_active !== 0 && String(item.city_id) === cityId && String(item.society_id) === societyId)
  const availableBlocks = config.calculator_blocks.filter((item) => item.is_active !== false && item.is_active !== 0 && String(item.calculator_phase_id) === phaseId)
  const availableTypes = config.calculator_property_types.filter((item) => item.is_active !== false && item.is_active !== 0 && item.category.toLowerCase() === category.toLowerCase())
  const city = config.cities.find((item) => String(item.id) === cityId)
  const society = config.societies.find((item) => String(item.id) === societyId)
  const phase = config.calculator_phases.find((item) => String(item.id) === phaseId)
  const block = config.calculator_blocks.find((item) => String(item.id) === blockId)

  const result = useMemo(() => calculateStagingEstimate(config, {
    phaseId, blockId, propertyTypeId, propertyName, category, size: marlaSize, coveredArea: toNumber(coveredArea),
    usesCoveredArea, transferType, payer, owners: Math.max(1, Number.parseInt(owners, 10) || 1), taxpayer,
    verification, bianaIncluded, agreementType, stampDutyPayment, customDcRate,
    customFbrRate, overrides, deletedLines, customExpenses,
  }), [config, phaseId, blockId, propertyTypeId, propertyName, category, marlaSize, coveredArea, usesCoveredArea, transferType, payer, owners, taxpayer, verification, bianaIncluded, agreementType, stampDutyPayment, customDcRate, customFbrRate, overrides, deletedLines, customExpenses])

  function nextStep() {
    setMessage('')
    if (step === 1 && (!cityId || !societyId || !phaseId || (availableBlocks.length > 0 && !blockId))) return setMessage('Please complete all required location fields.')
    if (step === 2 && (!propertyTypeId || toNumber(size) <= 0 || (usesCoveredArea && toNumber(coveredArea) <= 0))) return setMessage('Please complete the required property details.')
    setStep((value) => Math.min(3, value + 1))
  }

  function resetCalculator() {
    setStep(1); setShowResults(false); setCityId(''); setSocietyId(''); setPhaseId(''); setBlockId(''); setPayer('Purchaser')
    setCategory('Residential'); setPropertyTypeId(''); setSize('5'); setUnit('Marla'); setCoveredArea(''); setTransferType('Regular')
    setOwners('1'); setTaxpayer('Filer'); setVerification('Required'); setBianaIncluded('Included'); setAgreementType('Simple')
    setStampDutyPayment('Online'); setCustomDcRate(''); setCustomFbrRate(''); setOverrides({}); setDeletedLines([]); setCustomExpenses([]); setMessage('')
  }

  function addCustomExpense(event) {
    event.preventDefault()
    const label = customLabel.trim()
    const amount = toNumber(customAmount)
    if (!label || amount < 0) return setMessage('Enter an expense name and a non-negative amount.')
    setCustomExpenses((items) => [...items, { id: crypto.randomUUID(), label, amount }])
    setCustomLabel(''); setCustomAmount(''); setMessage('')
  }

  function downloadWordReport() {
    const rows = result.lines.map((line) => `<tr><td>${escapeHtml(line.label)}</td><td>${money(overrides[line.label] ?? line.amount)}</td></tr>`).join('')
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Property Transfer Expense Estimate</title></head><body style="font:14px Arial;color:#17202a"><h1 style="text-align:center">The Zalmi Marketing</h1><h2>Property Transfer Expense Estimate</h2><p>${escapeHtml([city?.name, society?.name, phase?.name, block?.name].filter(Boolean).join(' · '))}</p><p>${escapeHtml(category)} · ${escapeHtml(propertyType?.label || propertyName)} · ${escapeHtml(size)} ${escapeHtml(unit)}</p><table style="border-collapse:collapse;width:100%"><thead><tr><th align="left">Expense</th><th align="right">Amount</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><th align="left">Grand Total</th><th align="right">${money(result.grandTotal)}</th></tr></tfoot></table><p>Sample staging estimate only. Verify current official charges.</p></body></html>`
    downloadBlob(new Blob([html], { type: 'application/msword' }), 'Transfer_Summary.doc')
    setExportOpen(false)
  }

  function downloadImage(format) {
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = Math.max(700, 360 + result.lines.length * 58)
    const context = canvas.getContext('2d')
    if (!context) return
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#111827'
    context.textAlign = 'center'
    context.font = '700 34px Arial'
    context.fillText('THE ZALMI MARKETING', 600, 64)
    context.fillStyle = '#8b6b13'
    context.font = '600 24px Arial'
    context.fillText('Property Transfer Expense Estimate', 600, 108)
    context.textAlign = 'left'
    context.fillStyle = '#475569'
    context.font = '18px Arial'
    context.fillText([city?.name, society?.name, phase?.name, block?.name].filter(Boolean).join(' · '), 70, 160)
    context.fillText(`${category} · ${propertyType?.label || propertyName} · ${size} ${unit}`, 70, 192)
    let y = 250
    for (const line of result.lines) {
      context.fillStyle = '#111827'
      context.font = '600 18px Arial'
      context.fillText(line.label.slice(0, 80), 70, y)
      context.textAlign = 'right'
      context.fillText(money(overrides[line.label] ?? line.amount), 1130, y)
      context.textAlign = 'left'
      context.strokeStyle = '#e2e8f0'
      context.beginPath(); context.moveTo(70, y + 20); context.lineTo(1130, y + 20); context.stroke()
      y += 58
    }
    context.font = '700 24px Arial'
    context.fillStyle = '#111827'
    context.fillText('Grand Total', 70, y + 15)
    context.textAlign = 'right'
    context.fillText(money(result.grandTotal), 1130, y + 15)
    context.textAlign = 'left'
    context.font = '14px Arial'
    context.fillStyle = '#64748b'
    context.fillText('Synthetic staging estimate only. Verify current official charges.', 70, y + 55)
    canvas.toBlob((blob) => { if (blob) downloadBlob(blob, `Transfer_Summary.${format}`) }, format === 'jpg' ? 'image/jpeg' : 'image/png', .95)
    setExportOpen(false)
  }

  return <main className="calculator-page min-h-screen bg-background">
    <section className="calculator-hero relative overflow-hidden border-b border-[#D4AF37]/20 bg-slate-950 text-white print:hidden">
      <div className="calculator-hero-image" aria-hidden="true" />
      <div className="calculator-hero-glow" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-4xl space-y-4 px-4 text-center sm:px-6 lg:px-8">
        <span className="inline-flex items-center rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-1.5 text-xs font-medium"><Calculator className="mr-2 h-3.5 w-3.5 text-[#D4AF37]" />{calculatorContent.hero.badge}</span>
        <h1 className="font-display text-4xl font-extrabold sm:text-5xl lg:text-6xl">{calculatorContent.hero.heading}</h1>
        <p className="mx-auto max-w-2xl text-base text-slate-300 sm:text-lg">{calculatorContent.hero.subheading}</p>
      </div>
    </section>
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      {!showResults && <div className="mx-auto mb-6 grid max-w-2xl grid-cols-3 gap-1.5 sm:mb-8">
        {[['1', 'Location & Who', MapPin], ['2', 'Property', Building2], ['3', 'Transfer Options', Calculator]].map(([number, label, Icon]) => <button key={number} type="button" aria-label={`Step ${number}: ${label}`} disabled={Number(number) > step} onClick={() => setStep(Number(number))} className={`flex min-h-14 items-center gap-2 rounded-2xl border p-2 text-left transition sm:gap-3 sm:p-3 ${step === Number(number) ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-foreground shadow-sm' : step > Number(number) ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400' : 'border-border/50 bg-card/50 text-muted-foreground'}`}><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-sm font-bold ${step === Number(number) ? 'bg-[#D4AF37] text-black' : step > Number(number) ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>{step > Number(number) ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}</span><span className="hidden sm:block"><small className="block text-xs text-muted-foreground">Step {number}</small><strong className="text-sm">{label}</strong></span></button>)}
      </div>}

      {!showResults ? <section className="overflow-hidden rounded-3xl border border-border/60 bg-card/80 shadow-xl backdrop-blur-xl print:hidden">
        <div className="space-y-6 p-4 sm:p-8">
          {step === 1 && <>
            <StepHeading icon={MapPin} title="Step 1: Location & Who is Paying" description="Choose the city, society, phase, block, and transaction payer." />
            <div className="grid gap-4">
              <Field label="City" required><select id="city" name="city_id" value={cityId} onChange={(event) => { setCityId(event.target.value); setSocietyId(''); setPhaseId(''); setBlockId('') }}><option value="">Select City</option>{config.cities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
              <Field label="Society / Project" required><select id="society" name="society_id" disabled={!cityId} value={societyId} onChange={(event) => { setSocietyId(event.target.value); setPhaseId(''); setBlockId('') }}><option value="">{cityId ? 'Select Society' : 'Select City first'}</option>{availableSocieties.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
              <Field label="Calculator Phase" required><select id="phase" name="calculator_phase_id" disabled={!societyId} value={phaseId} onChange={(event) => { setPhaseId(event.target.value); setBlockId('') }}><option value="">{societyId ? 'Select Phase' : 'Select Society first'}</option>{availablePhases.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
              <Field label="Block" hint={availableBlocks.length ? 'Required' : 'Optional / Phase-level'}><select id="block" name="calculator_block_id" disabled={!phaseId || !availableBlocks.length} value={blockId} onChange={(event) => setBlockId(event.target.value)}><option value="">{!phaseId ? 'Select Phase first' : availableBlocks.length ? 'Select Block' : 'No blocks in this phase'}</option>{availableBlocks.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
              <div className="border-t border-border/60 pt-4"><Field label="Who is Paying" required><div className="grid grid-cols-2 gap-2 sm:gap-3">{['Purchaser', 'Seller'].map((value) => <Choice key={value} active={payer === value} onClick={() => setPayer(value)}>{value}</Choice>)}</div></Field></div>
            </div>
            <div className="flex justify-end pt-4"><GoldButton onClick={nextStep}>Next: Property Details <ArrowRight className="h-4 w-4" /></GoldButton></div>
          </>}

          {step === 2 && <>
            <StepHeading icon={Building2} title="Step 2: Property Details" description="Select category, property type, size, and covered area if applicable." />
            <Field label="Category" required><div className="grid grid-cols-3 gap-1.5 sm:gap-2">{['Residential', 'Commercial', 'Sector Shop'].map((value) => <Choice key={value} active={category === value} onClick={() => { setCategory(value); setPropertyTypeId('') }}>{value}</Choice>)}</div></Field>
            <Field label="Property Type" required><select id="propertyType" name="property_type" value={propertyTypeId} onChange={(event) => setPropertyTypeId(event.target.value)}><option value="">Select Property Type</option>{availableTypes.map((item) => <option key={item.id} value={item.id}>{item.label || item.property_type}</option>)}</select></Field>
            <div className="grid gap-4 sm:grid-cols-12"><div className="sm:col-span-7"><Field label="Property Size" required><input id="propSize" name="property_size" type="number" min="0.1" step="any" value={size} onChange={(event) => setSize(event.target.value)} placeholder="e.g. 5 or 10" /></Field></div><div className="sm:col-span-5"><Field label="Unit"><select id="propUnit" name="property_size_unit" value={unit} onChange={(event) => setUnit(event.target.value)}><option>Marla</option><option>Kanal</option><option>Sq. Yards</option></select></Field></div></div>
            <div className="flex flex-wrap items-center gap-2"><span className="mr-1 text-xs text-muted-foreground">Common:</span>{['3 Marla', '5 Marla', '10 Marla', '1 Kanal', '2 Kanal'].map((value) => <button key={value} type="button" className="calculator-chip" onClick={() => { const [amount, measure] = value.split(' '); setSize(amount); setUnit(measure === 'Kanal' ? 'Kanal' : 'Marla') }}>{value}</button>)}</div>
            {usesCoveredArea && <Field label="Covered Area (Sq. Ft.)" required><input id="coveredArea" name="covered_area" type="number" min="1" step="any" value={coveredArea} onChange={(event) => setCoveredArea(event.target.value)} placeholder="Enter covered area" /></Field>}
            <div className="flex flex-col justify-between gap-3 border-t border-border/60 pt-6 sm:flex-row"><OutlineButton onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4" />Back to Location</OutlineButton><GoldButton onClick={nextStep}>Next: Transfer Options <ArrowRight className="h-4 w-4" /></GoldButton></div>
          </>}

          {step === 3 && <>
            <StepHeading icon={Calculator} title="Step 3: Transfer & Tax Options" description="Configure transfer type, taxpayer status, and payment method." />
            <Field label="Transfer Type"><select id="transferType" name="transfer_type" value={transferType} onChange={(event) => setTransferType(event.target.value)}>{['Regular', 'Urgent', 'Executive', 'Hiba', 'Biana Only'].map((value) => <option key={value}>{value}</option>)}</select></Field>
            {transferType !== 'Biana Only' && payer !== 'Seller' && <Field label="Number of Owners"><input id="owners" name="number_of_owners" type="number" min="1" max="20" value={owners} onChange={(event) => setOwners(event.target.value)} /></Field>}
            {transferType !== 'Biana Only' && !(transferType === 'Hiba' && payer === 'Seller') && <Field label="Taxpayer Status (FBR)"><div className="grid grid-cols-2 gap-2 sm:gap-3">{['Filer', 'Non-Filer'].map((value) => <Choice key={value} active={taxpayer === value} onClick={() => setTaxpayer(value)}>{value}</Choice>)}</div></Field>}
            {transferType !== 'Biana Only' && payer === 'Purchaser' && transferType !== 'Hiba' && <div className="grid gap-4 border-t border-border/60 pt-4 sm:grid-cols-2"><Field label="Verification"><select id="verification" name="verification" value={verification} onChange={(event) => setVerification(event.target.value)}><option value="Required">Required (Rs. 5,250)</option><option value="Not Required">Not Required (Rs. 0)</option></select></Field><Field label="Biana"><select id="bianaIncluded" name="biana_included" value={bianaIncluded} onChange={(event) => setBianaIncluded(event.target.value)}><option>Included</option><option>Not Included</option></select></Field><Field label="Agreement to Sell"><select id="agreementType" name="agreement_type" value={agreementType} onChange={(event) => setAgreementType(event.target.value)}><option>Simple</option><option>DC Value</option></select></Field><Field label="Stamp Duty Payment"><select id="stampDutyPayment" name="stamp_duty_payment" value={stampDutyPayment} onChange={(event) => setStampDutyPayment(event.target.value)}><option>Online</option><option>Bank</option></select></Field></div>}
            <div className="space-y-3 border-t border-border/60 pt-4"><h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Custom DC & FBR Rate Override (Optional)</h3><p className="text-xs text-muted-foreground">Use a custom rate when the sample phase rate is not applicable.</p><div className="grid gap-3 sm:grid-cols-2"><Field label={`Custom DC Rate (Per ${usesCoveredArea ? 'Sq.Ft.' : 'Marla'}) (Rs.)`}><input id="customDc" name="custom_dc_rate" type="number" min="0" value={customDcRate} onChange={(event) => setCustomDcRate(event.target.value)} placeholder="e.g. 500000" /></Field><Field label={`Custom FBR Rate (Per ${usesCoveredArea ? 'Sq.Ft.' : 'Marla'}) (Rs.)`}><input id="customFbr" name="custom_fbr_rate" type="number" min="0" value={customFbrRate} onChange={(event) => setCustomFbrRate(event.target.value)} placeholder="e.g. 400000" /></Field></div></div>
            <div className="flex flex-col justify-between gap-3 border-t border-border/60 pt-6 sm:flex-row"><OutlineButton onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4" />Back to Property</OutlineButton><GoldButton onClick={() => { setMessage(''); setShowResults(true) }}><Calculator className="h-5 w-5" />Calculate Transfer Expenses</GoldButton></div>
          </>}
          {message && <p className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-600" role="alert">{message}</p>}
        </div>
      </section> : <section className="calculator-results space-y-6">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-between"><OutlineButton onClick={() => setShowResults(false)}><ArrowLeft className="h-4 w-4" />Modify Calculator Inputs</OutlineButton><div className="flex flex-wrap items-center gap-2"><OutlineButton onClick={() => window.print()}><Printer className="h-4 w-4" />Print / PDF</OutlineButton><div className="calculator-export-menu"><button type="button" className="calculator-export" aria-expanded={exportOpen} onClick={() => setExportOpen((open) => !open)}><Download className="h-4 w-4" />Save As...</button>{exportOpen && <div className="calculator-export-list" role="menu"><a role="menuitem" href={downloadCsv(result.lines)} download="zalmi-transfer-expense-estimate.csv" onClick={() => setExportOpen(false)}><Download className="h-4 w-4" />CSV Estimate</a><button type="button" role="menuitem" onClick={downloadWordReport}><FileCode className="h-4 w-4" />Word Document (.doc)</button><button type="button" role="menuitem" onClick={() => downloadImage('png')}><ImageIcon className="h-4 w-4" />PNG Image (.png)</button><button type="button" role="menuitem" onClick={() => downloadImage('jpg')}><ImageIcon className="h-4 w-4" />JPEG Image (.jpg)</button></div>}</div><button type="button" className="calculator-text-button" onClick={resetCalculator}><RefreshCw className="h-4 w-4" />Start Over</button></div></div>
        <article className="calculator-result-card overflow-hidden rounded-3xl border border-[#D4AF37]/30 bg-card shadow-2xl"><div className="hidden border-b p-6 text-center print:block"><h2 className="font-bold uppercase">The Zalmi Marketing</h2><p>Property Transfer Expense Estimate</p></div><header className="border-b border-border/70 bg-[#D4AF37]/5 p-5 sm:p-7"><p className="text-center text-xs font-bold uppercase tracking-[.18em] text-[#9b7514]">Estimated Transfer Expenses</p><p className="mt-2 text-center font-display text-4xl font-bold">{money(result.grandTotal)}</p><p className="mt-2 text-center text-xs text-muted-foreground">Synthetic staging estimate · verify applicable rates before any transaction</p></header>
          <div className="grid gap-3 border-b border-border/70 p-4 text-sm sm:grid-cols-2 sm:p-6"><div><span className="text-muted-foreground">Location</span><p className="font-semibold">{[city?.name, society?.name, phase?.name, block?.name].filter(Boolean).join(' · ')}</p></div><div><span className="text-muted-foreground">Property</span><p className="font-semibold">{category} · {propertyType?.label || propertyName} · {size} {unit}{coveredArea ? ` · ${coveredArea} Sq. Ft.` : ''}</p></div><div><span className="text-muted-foreground">Paying party</span><p className="font-semibold">{payer}</p></div><div><span className="text-muted-foreground">Valuations</span><p className="font-semibold">DC {money(result.dcValue)} · FBR {money(result.fbrValue)}</p></div></div>
          {!result.rateFound && <div className="mx-4 mt-4 flex gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-800 sm:mx-6"><AlertCircle className="h-4 w-4 shrink-0" />Official DC/FBR rates are not configured for this sample selection. Valuation is zero; add custom rates in Step 3 to estimate percentage taxes.</div>}
          {result.lines.length > 0 ? <div className="divide-y divide-border/70 px-4 sm:px-6">{result.lines.map((line) => <div className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-center" key={line.id || line.label}><div><div className="flex items-center gap-2"><strong>{line.label}</strong>{line.isCustom && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">Custom</span>}</div><p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-muted-foreground">{line.explanation}</p></div><div className="flex items-center justify-end gap-2"><span className="text-sm font-bold">{money(overrides[line.label] ?? line.amount)}</span>{!line.locked && <><input id={expenseInputId(line.label)} name={expenseInputId(line.label)} className="calculator-override" aria-label={`Override amount for ${line.label}`} type="number" min="0" value={overrides[line.label] ?? line.amount} onChange={(event) => setOverrides((current) => ({ ...current, [line.label]: event.target.value }))} /><button type="button" className="calculator-remove-line" aria-label={`Remove ${line.label}`} onClick={() => { setDeletedLines((current) => [...current, line.label]); setCustomExpenses((current) => current.filter((item) => item.id !== line.id)) }}><Trash2 className="h-4 w-4" /></button></>}</div></div>)}</div> : <p className="p-8 text-center text-sm text-muted-foreground">No expenses apply to this selection.</p>}
          <form className="grid gap-2 border-t border-border/70 bg-muted/20 p-4 sm:grid-cols-[1fr_12rem_auto] sm:p-6" onSubmit={addCustomExpense}><Field label="Custom expense"><input id="customExpenseLabel" name="custom_expense_label" value={customLabel} onChange={(event) => setCustomLabel(event.target.value)} placeholder="Expense name" /></Field><Field label="Amount (Rs.)"><input id="customExpenseAmount" name="custom_expense_amount" type="number" min="0" value={customAmount} onChange={(event) => setCustomAmount(event.target.value)} placeholder="0" /></Field><button type="submit" className="calculator-add-expense">Add Expense</button></form>
          <footer className="flex items-center justify-between gap-4 border-t border-border/70 p-5 sm:px-6"><span className="font-semibold">Grand Total</span><strong className="font-display text-2xl">{money(result.grandTotal)}</strong></footer>
        </article>
        <p className="text-center text-xs leading-relaxed text-muted-foreground">This synthetic estimate demonstrates the staging calculator UI and source calculation flow. It is not an official quote and may not reflect current government or society schedules.</p>
      </section>}
    </div>
  </main>
}

function Field({ label, required, hint, children }) { return <label className="calculator-field"><span>{label}{required && <em> *</em>}{hint && <small>{hint}</small>}</span>{children}</label> }
function StepHeading({ icon: Icon, title, description }) { return <div><h2 className="flex items-center gap-2 font-display text-xl font-bold"><Icon className="h-5 w-5 text-[#D4AF37]" />{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div> }
function Choice({ active, onClick, children }) { return <button type="button" onClick={onClick} className={`calculator-choice ${active ? 'is-selected' : ''}`}>{children}</button> }
function GoldButton({ onClick, children }) { return <button type="button" onClick={onClick} className="calculator-gold-button">{children}</button> }
function OutlineButton({ onClick, children }) { return <button type="button" onClick={onClick} className="calculator-outline-button">{children}</button> }
function CalculatorUnavailable() { return <main className="mx-auto max-w-xl px-4 py-24 text-center"><section className="rounded-2xl border border-red-500/30 bg-red-500/5 p-8"><AlertCircle className="mx-auto h-10 w-10 text-red-500" /><h1 className="mt-3 text-xl font-bold">{calculatorContent.hero.errorTitle}</h1><p className="mt-2 text-sm text-muted-foreground">The local synthetic calculator configuration is unavailable.</p><button type="button" className="calculator-gold-button mx-auto mt-5" onClick={() => window.location.reload()}><RefreshCw className="h-4 w-4" />{calculatorContent.hero.retryButton}</button><Link to="/" className="mt-5 block text-sm text-primary">Return to staging home</Link></section></main> }

function downloadCsv(lines) {
  const csv = ['Expense,Amount (PKR),Explanation', ...lines.map((line) => [line.label, line.amount, line.explanation].map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(','))].join('\r\n')
  return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])
}

function expenseInputId(label) {
  return `expense-override-${String(label).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`
}
