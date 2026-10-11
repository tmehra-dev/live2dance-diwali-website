import type { Performance, PerformanceType, Vendor, VendorCategory } from '../content/types'

export type Row = Record<string, string>

export interface FieldSpec {
  key: string
  label: string
  match: RegExp
  required?: boolean
}

export type Mapping = Record<string, string | null>

/** Columns that must never be copied to the website, whatever the mapping says. */
export const PRIVATE_COLUMN = /phone|e-?mail|contact person|permit|electric|licen[cs]e|upload|document|timestamp|sponsor|anything else|questions?|business type|menu and doc|address of|tax id|ein\b/i

export const vendorFields: FieldSpec[] = [
  { key: 'name', label: 'Vendor name', match: /vendor name|business|^name$|^vendor$/i, required: true },
  { key: 'category', label: 'Category / type of stall', match: /type of stall|category|stall type|^type$/i },
  { key: 'description', label: 'Description', match: /description|items|services offered|about/i },
  { key: 'links', label: 'Website / social handles', match: /website|social|instagram|handle|^links?$/i },
  { key: 'logo', label: 'Logo URL', match: /logo/i },
  { key: 'visible', label: 'Confirmed / show on site', match: /^paid$|confirmed|visible|show on site|^show$/i },
  { key: 'featured', label: 'Featured', match: /featured/i },
]

export const performanceFields: FieldSpec[] = [
  { key: 'title', label: 'Act / title', match: /^act$|title|performance|^name$|act name/i, required: true },
  { key: 'performer', label: 'Performer / group', match: /performer|artist|group|team|troupe/i },
  { key: 'type', label: 'Type', match: /^type$|category|genre|kind/i },
  { key: 'start', label: 'Start time', match: /start|^time$|slot/i },
  { key: 'end', label: 'End time', match: /^end|end time|finish/i },
  { key: 'stage', label: 'Stage', match: /stage|location|area/i },
  { key: 'description', label: 'Description', match: /description|about|details|blurb/i },
  { key: 'image', label: 'Image URL', match: /image|photo|picture/i },
  { key: 'link', label: 'Link (Instagram / website)', match: /link|instagram|website|social/i },
  { key: 'visible', label: 'Show on site', match: /visible|show|confirmed|publish/i },
]

export function detectMapping(headers: string[], fields: FieldSpec[]): Mapping {
  const used = new Set<string>()
  const mapping: Mapping = {}
  for (const field of fields) {
    // Form questions are long sentences that mention many words, so prefer the tersest header.
    const header = headers
      .filter((h) => !used.has(h) && !isPrivateColumn(h) && field.match.test(h.trim()))
      .sort((a, b) => a.length - b.length)[0]
    mapping[field.key] = header ?? null
    if (header) used.add(header)
  }
  return mapping
}

export function isPrivateColumn(header: string) {
  return PRIVATE_COLUMN.test(header)
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truthy(value: string | undefined) {
  return /^(y|yes|true|1|x|paid|confirmed|show|visible)$/i.test((value ?? '').trim())
}

const clean = (value: string | undefined) => (value ?? '').replace(/\\_/g, '_').replace(/\s+/g, ' ').trim()

export function normalizeVendorCategory(type: string, description = ''): VendorCategory {
  const t = `${type} ${description}`.toLowerCase()
  if (/food|sweet|savou?ry|snack|chai|tea|coffee|matcha|dessert|cake|bak|restaurant|drink|beverage/.test(type.toLowerCase())) return 'food'
  if (/henna|mehndi|mehendi|beauty|makeup|nail/.test(t)) return 'henna'
  if (/inform|service|travel|agency|invest|financ|real estate|insurance|education|consult/.test(type.toLowerCase())) return 'services'
  if (/saree|sari\b|saris|cloth|fashion|kurta|dupatta|lehenga|shoe|footwear|jutti|jacket|\bbags?\b|blouse|suits?\b|dress|linen|cotton/.test(t)) return 'fashion'
  if (/jewel|bangle|earring|necklace|ring\b|gift|craft|art\b|decor|candle|diya/.test(t)) return 'jewelry'
  if (/apparel/.test(t)) return 'fashion'
  if (/food/.test(t)) return 'food'
  return 'jewelry'
}

/** Pulls an Instagram profile and a website out of a free-text "Website/Social Media Handles" answer. */
export function parseLinks(raw: string): { website?: string; instagram?: string } {
  const text = clean(raw)
  if (!text || /^(n\/?a|none|no|wip|-)$/i.test(text)) return {}
  const out: { website?: string; instagram?: string } = {}

  const igUrl = text.match(/instagram\.com\/([A-Za-z0-9_.]+)/i)
  const igAt = text.match(/@([A-Za-z0-9_.]+)/)
  const handle = (igUrl?.[1] ?? igAt?.[1])?.replace(/\.$/, '').toLowerCase()
  if (handle) out.instagram = `https://www.instagram.com/${handle}`

  const tokens = text.split(/[\s,;|]+/).filter(Boolean)
  for (const token of tokens) {
    const t = token.replace(/^[^\w]+|[^\w/]+$/g, '')
    if (!t || /instagram\.com/i.test(t) || t.startsWith('@')) continue
    if (/^https?:\/\//i.test(token)) {
      out.website ??= token.replace(/[),.]+$/, '')
    } else if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(t) && !/^\d/.test(t)) {
      const [host, ...rest] = t.split('/')
      out.website ??= `https://${[host.toLowerCase(), ...rest].join('/')}`
    }
  }

  if (!out.instagram && !out.website && tokens.length === 1 && /^[A-Za-z0-9_.]{3,30}$/.test(tokens[0])) {
    out.instagram = `https://www.instagram.com/${tokens[0].toLowerCase()}`
  }
  return out
}

function mapped(row: Row, mapping: Mapping, key: string) {
  const header = mapping[key]
  return header ? clean(row[header]) : ''
}

export interface ImportResult<T> {
  items: T[]
  warnings: string[]
}

export function mapVendors(rows: Row[], mapping: Mapping): ImportResult<Vendor> {
  const warnings: string[] = []
  const items: Vendor[] = []
  const seen = new Set<string>()
  rows.forEach((row, index) => {
    const name = mapped(row, mapping, 'name')
    if (!name) return
    const others = Object.keys(mapping).filter((k) => k !== 'name' && mapping[k])
    if (others.length && others.every((k) => !mapped(row, mapping, k))) {
      warnings.push(`Row ${index + 2}: skipped "${name}" because every other column is empty.`)
      return
    }
    const id = slugify(name)
    if (seen.has(id)) {
      warnings.push(`Row ${index + 2}: "${name}" appears more than once; kept the first.`)
      return
    }
    seen.add(id)
    const type = mapped(row, mapping, 'category')
    const description = mapped(row, mapping, 'description')
    const links = parseLinks(mapped(row, mapping, 'links'))
    const logo = mapped(row, mapping, 'logo')
    if (!description) warnings.push(`Row ${index + 2}: "${name}" has no description.`)
    items.push({
      id,
      name,
      category: normalizeVendorCategory(type, description),
      description,
      ...links,
      ...(logo ? { logo } : {}),
      featured: truthy(mapped(row, mapping, 'featured')),
      visible: mapping.visible ? truthy(mapped(row, mapping, 'visible')) : true,
    })
  })
  return { items, warnings }
}

export function normalizePerformanceType(raw: string): PerformanceType {
  const t = raw.toLowerCase()
  if (/stand.?up|comedy|comic|comedian/.test(t)) return 'standup'
  if (/\bdj\b|disc jockey/.test(t)) return 'dj'
  if (/band|instrument|live music|orchestra|drum|dhol|tabla|guitar/.test(t)) return 'band'
  if (/sing|vocal|song|choir|karaoke|music/.test(t)) return 'singing'
  if (/danc|bollywood|bhangra|garba|kathak|bharat|folk|hip.?hop|choreo/.test(t)) return 'dance'
  return 'other'
}

/** Accepts "1:30 PM", "1pm", "13:30", "13" and returns "HH:MM" (24h), or "" if unreadable. */
export function parseTime(raw: string): string {
  const m = clean(raw).toLowerCase().match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?$/)
  if (!m) return ''
  let hour = Number(m[1])
  const minute = Number(m[2] ?? 0)
  const meridiem = m[3]?.replace(/\./g, '')
  if (meridiem === 'pm' && hour < 12) hour += 12
  if (meridiem === 'am' && hour === 12) hour = 0
  // The Mela runs 12–6 PM, so a bare "1" or "1:30" means the afternoon.
  if (!meridiem && hour >= 1 && hour <= 7) hour += 12
  if (hour > 23 || minute > 59) return ''
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export function mapPerformances(rows: Row[], mapping: Mapping): ImportResult<Performance> {
  const warnings: string[] = []
  const items: Performance[] = []
  const ids = new Map<string, number>()
  rows.forEach((row, index) => {
    const title = mapped(row, mapping, 'title')
    if (!title) return
    const base = slugify(title)
    const count = ids.get(base) ?? 0
    ids.set(base, count + 1)
    const rawStart = mapped(row, mapping, 'start')
    const start = parseTime(rawStart)
    if (rawStart && !start) warnings.push(`Row ${index + 2}: couldn't read start time "${rawStart}".`)
    const rawType = mapped(row, mapping, 'type')
    const type = normalizePerformanceType(rawType || title)
    const visibleRaw = mapped(row, mapping, 'visible')
    items.push({
      id: count ? `${base}-${count + 1}` : base,
      title,
      performer: mapped(row, mapping, 'performer') || undefined,
      type,
      start: start || undefined,
      end: parseTime(mapped(row, mapping, 'end')) || undefined,
      stage: mapped(row, mapping, 'stage') || undefined,
      description: mapped(row, mapping, 'description') || undefined,
      image: mapped(row, mapping, 'image') || undefined,
      link: mapped(row, mapping, 'link') || undefined,
      visible: visibleRaw ? truthy(visibleRaw) : true,
    })
  })
  items.sort((a, b) => (a.start ?? '99').localeCompare(b.start ?? '99'))
  return { items, warnings }
}

export type ImportMode = 'merge' | 'replace'

export interface Diff<T> {
  added: T[]
  updated: T[]
  removed: T[]
  unchanged: T[]
  result: T[]
}

/**
 * Merge keeps anything an admin already edited (names, descriptions, logos), fills gaps from the
 * import, adds new rows, and only ever turns visibility on. Replace swaps the whole list.
 */
export function diffImport<T extends { id: string; visible: boolean }>(existing: T[], incoming: T[], mode: ImportMode): Diff<T> {
  const byId = new Map(existing.map((item) => [item.id, item]))
  const incomingIds = new Set(incoming.map((item) => item.id))
  const added: T[] = []
  const updated: T[] = []
  const unchanged: T[] = []
  const result: T[] = []

  for (const next of incoming) {
    const prev = byId.get(next.id)
    if (!prev) {
      added.push(next)
      result.push(next)
      continue
    }
    let merged: T
    if (mode === 'replace') {
      merged = next
    } else {
      merged = { ...prev }
      for (const [key, value] of Object.entries(next) as [keyof T, T[keyof T]][]) {
        const current = merged[key]
        if (key === 'visible') merged.visible = prev.visible || next.visible
        else if ((current === undefined || current === '') && value !== undefined && value !== '') merged[key] = value
      }
    }
    if (JSON.stringify(merged) === JSON.stringify(prev)) unchanged.push(merged)
    else updated.push(merged)
    result.push(merged)
  }

  const removed = existing.filter((item) => !incomingIds.has(item.id))
  if (mode === 'merge') result.push(...removed)
  return { added, updated, removed: mode === 'replace' ? removed : [], unchanged, result }
}
