import { useMemo, useState } from 'react'
import Papa from 'papaparse'
import { FileSpreadsheet, Link2, ShieldCheck, Upload } from 'lucide-react'
import type { Performance, Vendor } from '../content/types'
import {
  detectMapping,
  diffImport,
  isPrivateColumn,
  mapPerformances,
  mapVendors,
  performanceFields,
  vendorFields,
  type ImportMode,
  type Mapping,
  type Row,
} from '../lib/importers'
import { formatTime } from '../lib/time'
import type { Backend } from './api'
import { Button, Modal, downloadText } from './components'
import { CSV_TEMPLATES } from './fields'

type Kind = 'vendors' | 'performances'
type Item = Vendor | Performance

interface Props<T extends Item> {
  kind: Kind
  existing: T[]
  backend: Backend
  onApply: (rows: T[]) => void
  onClose: () => void
}

export function ImportWizard<T extends Item>({ kind, existing, backend, onApply, onClose }: Props<T>) {
  const fields = kind === 'vendors' ? vendorFields : performanceFields
  const [step, setStep] = useState<'source' | 'map' | 'preview'>('source')
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<Row[]>([])
  const [dropped, setDropped] = useState<string[]>([])
  const [mapping, setMapping] = useState<Mapping>({})
  const [mode, setMode] = useState<ImportMode>('merge')
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const loadRows = (hs: string[], rs: Row[], serverDropped: string[] = []) => {
    const privateCols = hs.filter(isPrivateColumn)
    const safe = hs.filter((h) => h && !isPrivateColumn(h))
    // Strip private answers right away so they never sit in memory longer than the parse.
    const cleaned = rs.map((r) => Object.fromEntries(safe.map((h) => [h, r[h] ?? ''])))
    setHeaders(safe)
    setRows(cleaned)
    setDropped([...serverDropped, ...privateCols])
    setMapping(detectMapping(safe, fields))
    setStep('map')
  }

  const fromFile = (file?: File) => {
    if (!file) return
    setError('')
    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (res) => {
        if (!res.meta.fields?.length) return setError('That file has no header row.')
        loadRows(res.meta.fields, res.data)
      },
      error: (err) => setError(err.message),
    })
  }

  const fromSheet = async () => {
    setBusy(true)
    setError('')
    try {
      const sheet = await backend.readSheet(url)
      loadRows(sheet.headers, sheet.rows, sheet.dropped)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const result = useMemo(() => {
    if (step !== 'preview') return null
    const mapped = kind === 'vendors' ? mapVendors(rows, mapping) : mapPerformances(rows, mapping)
    const diff = diffImport(existing as Item[], mapped.items as Item[], mode)
    return { ...mapped, diff }
  }, [step, kind, rows, mapping, existing, mode])

  const missingRequired = fields.filter((f) => f.required && !mapping[f.key])

  const footer = (
    <>
      {step !== 'source' && (
        <Button variant="ghost" onClick={() => setStep(step === 'preview' ? 'map' : 'source')}>
          Back
        </Button>
      )}
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      {step === 'map' && (
        <Button disabled={missingRequired.length > 0} onClick={() => setStep('preview')}>
          Preview changes
        </Button>
      )}
      {step === 'preview' && result && (
        <Button
          disabled={result.diff.added.length + result.diff.updated.length + result.diff.removed.length === 0}
          onClick={() => {
            onApply(result.diff.result as T[])
            onClose()
          }}
        >
          Apply {result.diff.added.length + result.diff.updated.length + result.diff.removed.length} changes
        </Button>
      )}
    </>
  )

  return (
    <Modal title={`Import ${kind}`} onClose={onClose} footer={footer} wide>
      <ol className="mb-6 flex gap-2 text-sm font-semibold">
        {(['source', 'map', 'preview'] as const).map((s, i) => (
          <li key={s} className={`rounded-full px-3 py-1 ${step === s ? 'bg-rani-600 text-white' : 'bg-night-900/5 text-night-700'}`}>
            {i + 1}. {s === 'source' ? 'Choose file' : s === 'map' ? 'Match columns' : 'Preview'}
          </li>
        ))}
      </ol>

      {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      {step === 'source' && (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-night-900/20 bg-white p-8 text-center hover:border-rani-500">
            <Upload className="size-8 text-rani-600" />
            <span className="font-display text-lg font-bold text-night-900">Upload a CSV file</span>
            <span className="text-sm text-night-700/70">In Google Sheets: File → Download → Comma-separated values (.csv)</span>
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => fromFile(e.target.files?.[0])} />
          </label>
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-6 ring-1 ring-night-900/10">
            <Link2 className="size-8 text-peacock-700" />
            <span className="font-display text-lg font-bold text-night-900">Or paste a Google Sheet link</span>
            <span className="text-sm text-night-700/70">
              The Sheet stays private: it's read by your Apps Script, and private columns are dropped before anything reaches this page. Include <code>#gid=</code> to pick a specific tab.
            </span>
            <input
              className="rounded-xl border border-night-900/15 px-3 py-2 text-night-900"
              placeholder="https://docs.google.com/spreadsheets/d/…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button busy={busy} disabled={!url || backend.mode === 'preview'} onClick={fromSheet}>
              Read Sheet
            </Button>
            {backend.mode === 'preview' && <span className="text-xs text-night-700/60">Available once the Google Sheet backend is connected.</span>}
          </div>
          <div className="md:col-span-2">
            <Button variant="ghost" onClick={() => downloadText(`${kind}-template.csv`, CSV_TEMPLATES[kind])}>
              <FileSpreadsheet className="size-4" /> Download a blank {kind} template
            </Button>
          </div>
        </div>
      )}

      {step === 'map' && (
        <div className="space-y-6">
          <p className="text-night-800">
            Found <strong>{rows.length}</strong> rows. We matched the columns we recognised. Check them, then preview.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => (
              <label key={f.key} className="flex flex-col gap-1 rounded-xl bg-white p-3 ring-1 ring-night-900/10">
                <span className="text-sm font-semibold text-night-900">
                  {f.label} {f.required && <span className="text-rani-600">*</span>}
                </span>
                <select
                  className="rounded-lg border border-night-900/15 px-2 py-1.5 text-night-900"
                  value={mapping[f.key] ?? ''}
                  onChange={(e) => setMapping({ ...mapping, [f.key]: e.target.value || null })}
                >
                  <option value="">Don't import</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h.length > 70 ? `${h.slice(0, 70)}…` : h}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          {dropped.length > 0 && (
            <div className="rounded-2xl bg-peacock-500/10 p-4 text-sm text-night-900">
              <p className="flex items-center gap-2 font-semibold text-peacock-700">
                <ShieldCheck className="size-5" /> {dropped.length} private columns are never imported
              </p>
              <p className="mt-1 text-night-700/80">{dropped.map((d) => (d.length > 40 ? `${d.slice(0, 40)}…` : d)).join(' · ')}</p>
            </div>
          )}
          {kind === 'vendors' && !mapping.visible && (
            <p className="rounded-xl bg-haldi-100 px-4 py-3 text-sm text-night-900">
              No "Paid / confirmed" column matched, so every imported vendor will be shown on the site.
            </p>
          )}
        </div>
      )}

      {step === 'preview' && result && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-night-900">How should this import be applied?</span>
            {(['merge', 'replace'] as const).map((m) => (
              <label key={m} className={`cursor-pointer rounded-xl px-3 py-2 text-sm ring-1 ${mode === m ? 'bg-rani-600 text-white ring-rani-600' : 'bg-white text-night-900 ring-night-900/15'}`}>
                <input type="radio" className="sr-only" checked={mode === m} onChange={() => setMode(m)} />
                {m === 'merge' ? 'Merge: keep my edits, add new rows' : 'Replace the whole list'}
              </label>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
            <Stat label="New" value={result.diff.added.length} tone="text-peacock-700" />
            <Stat label="Updated" value={result.diff.updated.length} tone="text-marigold-600" />
            <Stat label="Removed" value={result.diff.removed.length} tone="text-red-700" />
            <Stat label="Already up to date" value={result.diff.unchanged.length} tone="text-night-700" />
          </div>
          {result.diff.added.length + result.diff.updated.length + result.diff.removed.length === 0 && (
            <p className="rounded-xl bg-peacock-500/10 px-4 py-3 text-sm text-night-900">
              Everything in this file is already on the website. Merge never overwrites names, descriptions or logos you've edited. Choose "Replace" to start fresh from the file.
            </p>
          )}
          {result.warnings.length > 0 && (
            <ul className="space-y-1 rounded-xl bg-haldi-100 px-4 py-3 text-sm text-night-900">
              {result.warnings.slice(0, 8).map((w) => (
                <li key={w}>⚠ {w}</li>
              ))}
              {result.warnings.length > 8 && <li>…and {result.warnings.length - 8} more</li>}
            </ul>
          )}
          <div className="overflow-x-auto rounded-xl ring-1 ring-night-900/10">
            <table className="w-full bg-white text-left text-sm text-night-900">
              <thead className="bg-night-900/5 text-xs tracking-wide uppercase">
                <tr>
                  <th className="px-3 py-2">Change</th>
                  <th className="px-3 py-2">{kind === 'vendors' ? 'Name' : 'Act'}</th>
                  <th className="px-3 py-2">{kind === 'vendors' ? 'Category' : 'Time / type'}</th>
                  <th className="px-3 py-2">Shown</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ...result.diff.added.map((r) => ['New', r] as const),
                  ...result.diff.updated.map((r) => ['Updated', r] as const),
                  ...result.diff.removed.map((r) => ['Removed', r] as const),
                ].map(([change, r]) => (
                  <tr key={`${change}-${r.id}`} className="border-t border-night-900/5">
                    <td className="px-3 py-2 font-semibold">{change}</td>
                    <td className="px-3 py-2">{'name' in r ? r.name : r.title}</td>
                    <td className="px-3 py-2">{'category' in r ? r.category : `${formatTime(r.start) || 'no time'} · ${r.type}`}</td>
                    <td className="px-3 py-2">{r.visible ? 'Yes' : 'Hidden'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  )
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-night-900/10">
      <p className={`font-display text-3xl font-extrabold ${tone}`}>{value}</p>
      <p className="text-sm text-night-700/70">{label}</p>
    </div>
  )
}
