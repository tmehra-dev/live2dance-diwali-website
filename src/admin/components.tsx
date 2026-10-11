import { useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { ImagePlus, Loader2 } from 'lucide-react'
import type { Field } from './fields'

export function Button({
  variant = 'primary',
  busy,
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; busy?: boolean }) {
  const styles = {
    primary: 'bg-rani-600 text-white hover:bg-rani-700 disabled:bg-rani-600/50',
    secondary: 'bg-white text-night-900 ring-1 ring-night-900/15 hover:ring-night-900/40',
    danger: 'bg-white text-red-700 ring-1 ring-red-200 hover:bg-red-50',
    ghost: 'text-night-700 hover:bg-night-900/5',
  }[variant]
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed ${styles} ${className}`}
      disabled={busy || props.disabled}
      {...props}
    >
      {busy && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  )
}

export function Card({ title, description, children, actions }: { title?: string; description?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-night-900/10 sm:p-6">
      {(title || actions) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-display text-xl font-bold text-night-900">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-night-700/70">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${checked ? 'bg-peacock-500' : 'bg-night-900/20'}`}
    >
      <span className={`inline-block size-5 rounded-full bg-white shadow transition ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  )
}

const inputClass =
  'w-full rounded-xl border border-night-900/15 bg-white px-3 py-2 text-night-900 placeholder:text-night-900/35 focus:border-rani-500 focus:ring-2 focus:ring-rani-500/20 focus:outline-none'

function ImageInput({ value, onChange, onUpload }: { value: string; onChange: (v: string) => void; onUpload: (f: File) => Promise<string> }) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const pick = async (file?: File) => {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      onChange(await onUpload(file))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="flex items-start gap-3">
      <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-night-900/5 ring-1 ring-night-900/10">
        {value ? <img src={resolveAsset(value)} alt="" className="size-full object-contain" /> : <ImagePlus className="size-6 text-night-900/30" />}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <input className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Paste an image link, or upload →" />
        <div className="flex items-center gap-2">
          <Button variant="secondary" busy={busy} onClick={() => input.current?.click()}>
            Upload image
          </Button>
          {value && (
            <Button variant="ghost" onClick={() => onChange('')}>
              Remove
            </Button>
          )}
        </div>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      </div>
    </div>
  )
}

/** Paths like "media/x.webp" live next to index.html; make them resolve from admin.html too. */
export function resolveAsset(src: string) {
  return /^(https?:|data:|\/)/.test(src) ? src : `./${src}`
}

export function FieldInput({
  field,
  value,
  onChange,
  onUpload,
}: {
  field: Field
  value: unknown
  onChange: (v: unknown) => void
  onUpload: (f: File) => Promise<string>
}) {
  const v = value === undefined || value === null ? '' : value
  const id = `f-${field.key}`
  const control = (() => {
    switch (field.type) {
      case 'bool':
        return <Toggle checked={!!value} onChange={onChange} label={field.label} />
      case 'textarea':
        return <textarea id={id} className={`${inputClass} min-h-28`} value={String(v)} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} />
      case 'select':
        return (
          <select id={id} className={inputClass} value={String(v)} onChange={(e) => onChange(e.target.value)}>
            {field.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )
      case 'image':
        return <ImageInput value={String(v)} onChange={onChange} onUpload={onUpload} />
      default:
        return (
          <input
            id={id}
            className={inputClass}
            type={field.type === 'url' ? 'url' : field.type === 'email' ? 'email' : field.type === 'date' ? 'date' : field.type === 'time' ? 'time' : 'text'}
            value={String(v)}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder ?? (field.type === 'url' ? 'https://' : undefined)}
          />
        )
    }
  })()

  if (field.type === 'bool') {
    return (
      <div className="flex items-start justify-between gap-4 rounded-xl bg-night-900/[0.03] px-4 py-3">
        <div>
          <p className="font-semibold text-night-900">{field.label}</p>
          {field.help && <p className="text-sm text-night-700/70">{field.help}</p>}
        </div>
        {control}
      </div>
    )
  }
  return (
    <div>
      <label htmlFor={id} className="mb-1 block font-semibold text-night-900">
        {field.label}
      </label>
      {control}
      {field.help && <p className="mt-1 text-sm text-night-700/70">{field.help}</p>}
    </div>
  )
}

export function Modal({ title, children, onClose, footer, wide }: { title: string; children: ReactNode; onClose: () => void; footer?: ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-night-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal
        aria-label={title}
        className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-[#faf7fc] shadow-2xl sm:rounded-3xl ${wide ? 'max-w-5xl' : 'max-w-2xl'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-night-900/10 px-6 py-4">
          <h2 className="font-display text-xl font-bold text-night-900">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-full px-3 py-1 text-2xl leading-none text-night-700 hover:bg-night-900/5" aria-label="Close">
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-night-900/10 px-6 py-4">{footer}</div>}
      </div>
    </div>
  )
}

export function downloadText(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
