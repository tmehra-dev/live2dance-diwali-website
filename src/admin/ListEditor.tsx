import { useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { slugify } from '../lib/importers'
import { Button, FieldInput, Modal, Toggle, resolveAsset } from './components'
import type { Field } from './fields'

type Row = { id: string; visible: boolean } & Record<string, unknown>

interface Props<T extends Row> {
  rows: T[]
  onChange: (rows: T[]) => void
  fields: Field[]
  titleKey: keyof T & string
  subtitle?: (row: T) => ReactNode
  imageKey?: keyof T & string
  blank: () => T
  onUpload: (f: File) => Promise<string>
  searchable?: boolean
  reorderable?: boolean
  itemLabel: string
}

export function ListEditor<T extends Row>({ rows, onChange, fields, titleKey, subtitle, imageKey, blank, onUpload, searchable, reorderable, itemLabel }: Props<T>) {
  const [editing, setEditing] = useState<{ index: number; draft: T } | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'shown' | 'hidden'>('all')

  const q = query.trim().toLowerCase()
  const visibleIndexes = rows
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => (filter === 'all' || (filter === 'shown' ? r.visible : !r.visible)) && (!q || JSON.stringify(r).toLowerCase().includes(q)))

  const update = (index: number, patch: Partial<T>) => onChange(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  const move = (index: number, delta: number) => {
    const next = [...rows]
    const [item] = next.splice(index, 1)
    next.splice(index + delta, 0, item)
    onChange(next)
  }

  const saveDraft = () => {
    if (!editing) return
    const draft = { ...editing.draft }
    if (!draft.id) draft.id = slugify(String(draft[titleKey] ?? '')) || `item-${Date.now()}`
    if (editing.index === -1) onChange([...rows, draft])
    else onChange(rows.map((r, i) => (i === editing.index ? draft : r)))
    setEditing(null)
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {searchable && (
          <label className="relative min-w-48 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-night-900/40" />
            <input
              className="w-full rounded-xl border border-night-900/15 bg-white py-2 pr-3 pl-9 text-night-900"
              placeholder={`Search ${itemLabel}s`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        )}
        <div className="flex rounded-xl bg-night-900/5 p-1 text-sm">
          {(['all', 'shown', 'hidden'] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)} className={`rounded-lg px-3 py-1 font-semibold capitalize ${filter === f ? 'bg-white text-night-900 shadow-sm' : 'text-night-700'}`}>
              {f} ({f === 'all' ? rows.length : rows.filter((r) => (f === 'shown' ? r.visible : !r.visible)).length})
            </button>
          ))}
        </div>
        <Button className="ml-auto" onClick={() => setEditing({ index: -1, draft: blank() })}>
          <Plus className="size-4" /> Add {itemLabel}
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl bg-night-900/[0.03] px-4 py-8 text-center text-night-700/70">No {itemLabel}s yet. Add one, or import a CSV.</p>
      ) : (
        <ul className="divide-y divide-night-900/5 overflow-hidden rounded-xl ring-1 ring-night-900/10">
          {visibleIndexes.map(({ r, i }) => (
            <li key={`${r.id}-${i}`} className={`flex items-center gap-3 bg-white px-3 py-2.5 ${r.visible ? '' : 'opacity-60'}`}>
              {imageKey && (
                <div className="size-11 shrink-0 overflow-hidden rounded-lg bg-night-900/5">
                  {r[imageKey] ? <img src={resolveAsset(String(r[imageKey]))} alt="" className="size-full object-cover" /> : null}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-night-900">{String(r[titleKey] || '(untitled)')}</p>
                {subtitle && <p className="truncate text-sm text-night-700/70">{subtitle(r)}</p>}
              </div>
              <Toggle checked={r.visible} onChange={(v) => update(i, { visible: v } as Partial<T>)} label={`Show ${String(r[titleKey])}`} />
              {reorderable && !q && filter === 'all' && (
                <span className="hidden sm:flex">
                  <Button variant="ghost" className="!px-2" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button variant="ghost" className="!px-2" disabled={i === rows.length - 1} onClick={() => move(i, 1)} aria-label="Move down">
                    <ArrowDown className="size-4" />
                  </Button>
                </span>
              )}
              <Button variant="ghost" className="!px-2" onClick={() => setEditing({ index: i, draft: { ...r } })} aria-label="Edit">
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                className="!px-2 text-red-700"
                onClick={() => window.confirm(`Delete "${String(r[titleKey])}"? You can undo by not publishing, or from History.`) && onChange(rows.filter((_, k) => k !== i))}
                aria-label="Delete"
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <Modal
          title={editing.index === -1 ? `New ${itemLabel}` : `Edit ${itemLabel}`}
          onClose={() => setEditing(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button onClick={saveDraft} disabled={!String(editing.draft[titleKey] ?? '').trim()}>
                Done
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            {fields.map((f) => (
              <FieldInput
                key={f.key}
                field={f}
                value={editing.draft[f.key]}
                onUpload={onUpload}
                onChange={(v) => setEditing({ ...editing, draft: { ...editing.draft, [f.key]: v } })}
              />
            ))}
          </div>
        </Modal>
      )}
    </div>
  )
}
