import { useEffect, useState } from 'react'
import { bakedContent, defaultSections, defaultSettings } from '../content/defaults'
import type { Activity, Faq, Performance, Section, Settings, SiteContent, Vendor, VendorCategory } from '../content/types'
import { normalizePerformanceType, parseTime, slugify, truthy } from './importers'

export interface SiteConfig {
  /** Web-app URL of the Google Apps Script attached to the content Sheet. */
  contentApiUrl: string
}

export const CACHE_KEY = 'l2d-content-v1'
const REFRESH_MS = 60_000

export async function loadSiteConfig(): Promise<SiteConfig> {
  try {
    const res = await fetch('site-config.json', { cache: 'no-store' })
    if (res.ok) return { contentApiUrl: '', ...(await res.json()) }
  } catch {
    // A missing config just means the site runs on its baked-in content.
  }
  return { contentApiUrl: '' }
}

const bool = (value: unknown, fallback: boolean) =>
  value === undefined || value === null || value === '' ? fallback : typeof value === 'boolean' ? value : truthy(String(value))
const str = (value: unknown) => (value === undefined || value === null ? '' : String(value).trim())

export function normalizeSettings(raw: Record<string, unknown> = {}): Settings {
  const out = { ...defaultSettings } as Record<string, unknown>
  for (const [key, fallback] of Object.entries(defaultSettings)) {
    if (!(key in raw)) continue
    out[key] = typeof fallback === 'boolean' ? bool(raw[key], fallback) : str(raw[key])
  }
  const s = out as unknown as Settings
  if (!['auto', 'on', 'off'].includes(s.eventDayMode)) s.eventDayMode = 'auto'
  if (!/^[+-]\d{2}:\d{2}$/.test(s.utcOffset)) s.utcOffset = defaultSettings.utcOffset
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s.eventDate)) s.eventDate = defaultSettings.eventDate
  s.startTime = parseTime(s.startTime) || defaultSettings.startTime
  s.endTime = parseTime(s.endTime) || defaultSettings.endTime
  return s
}

function normalizeSections(raw: unknown): Section[] {
  if (!Array.isArray(raw) || !raw.length) return defaultSections
  const known = new Map(defaultSections.map((s) => [s.id, s]))
  const out: Section[] = []
  for (const r of raw as Record<string, unknown>[]) {
    const base = known.get(str(r.id) as Section['id'])
    if (!base || out.some((s) => s.id === base.id)) continue
    out.push({ id: base.id, label: str(r.label) || base.label, visible: bool(r.visible, true) })
  }
  for (const s of defaultSections) if (!out.some((o) => o.id === s.id)) out.push({ ...s, visible: false })
  return out
}

const CATEGORIES: VendorCategory[] = ['food', 'fashion', 'jewelry', 'henna', 'services']

function normalizeVendors(raw: unknown): Vendor[] {
  if (!Array.isArray(raw)) return bakedContent.vendors
  return (raw as Record<string, unknown>[])
    .filter((r) => str(r.name))
    .map((r) => ({
      id: str(r.id) || slugify(str(r.name)),
      name: str(r.name),
      category: (CATEGORIES.includes(str(r.category) as VendorCategory) ? str(r.category) : 'jewelry') as VendorCategory,
      description: str(r.description),
      website: str(r.website) || undefined,
      instagram: str(r.instagram) || undefined,
      logo: str(r.logo) || undefined,
      featured: bool(r.featured, false),
      visible: bool(r.visible, true),
    }))
}

function normalizePerformances(raw: unknown): Performance[] {
  if (!Array.isArray(raw)) return []
  return (raw as Record<string, unknown>[])
    .filter((r) => str(r.title))
    .map((r) => ({
      id: str(r.id) || slugify(str(r.title)),
      title: str(r.title),
      performer: str(r.performer) || undefined,
      type: normalizePerformanceType(str(r.type)),
      start: parseTime(str(r.start)) || undefined,
      end: parseTime(str(r.end)) || undefined,
      stage: str(r.stage) || undefined,
      description: str(r.description) || undefined,
      image: str(r.image) || undefined,
      link: str(r.link) || undefined,
      visible: bool(r.visible, true),
    }))
    .sort((a, b) => (a.start ?? '99').localeCompare(b.start ?? '99'))
}

function normalizeList<T extends Activity | Faq>(raw: unknown, fallback: T[], fields: (keyof T)[]): T[] {
  if (!Array.isArray(raw)) return fallback
  return (raw as Record<string, unknown>[])
    .filter((r) => str(r[fields[0] as string]))
    .map((r, i) => {
      const item: Record<string, unknown> = { id: str(r.id) || `${String(fields[0])}-${i + 1}`, visible: bool(r.visible, true) }
      for (const f of fields) item[f as string] = str(r[f as string])
      return item as T
    })
}

export function normalizeContent(raw: Partial<Record<keyof SiteContent, unknown>>): SiteContent {
  return {
    settings: normalizeSettings(raw.settings as Record<string, unknown>),
    sections: normalizeSections(raw.sections),
    vendors: normalizeVendors(raw.vendors),
    performances: normalizePerformances(raw.performances),
    activities: normalizeList<Activity>(raw.activities, bakedContent.activities, ['title', 'description', 'icon']),
    faqs: normalizeList<Faq>(raw.faqs, bakedContent.faqs, ['question', 'answer']),
    updatedAt: str(raw.updatedAt) || undefined,
  }
}

export async function fetchContent(apiUrl: string): Promise<SiteContent> {
  // The timestamp defeats browser and proxy caches so a fresh publish shows on the next load.
  const res = await fetch(`${apiUrl}${apiUrl.includes('?') ? '&' : '?'}action=content&t=${Date.now()}`, { redirect: 'follow', cache: 'no-store' })
  if (!res.ok) throw new Error(`Content request failed (${res.status})`)
  const body = await res.json()
  if (body.error) throw new Error(body.error)
  // A brand-new Sheet has no settings yet; keep the built-in content until an admin fills it.
  if (!body.settings || !Object.keys(body.settings).length) throw new Error('Content Sheet is not filled in yet')
  return normalizeContent(body)
}

function readCache(): SiteContent | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? normalizeContent(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

/**
 * Renders instantly from the content baked into the build, swaps in the last cached copy,
 * then refreshes from the live Sheet in the background.
 */
export function useSiteContent() {
  const [content, setContent] = useState<SiteContent>(bakedContent)
  const [source, setSource] = useState<'baked' | 'cache' | 'live'>('baked')

  useEffect(() => {
    const cached = readCache()
    if (cached) {
      setContent(cached)
      setSource('cache')
    }
    let cancelled = false
    let timer: number | undefined
    let apiUrl = ''

    const refresh = async () => {
      if (!apiUrl || document.visibilityState === 'hidden') return
      try {
        const live = await fetchContent(apiUrl)
        if (cancelled) return
        setContent(live)
        setSource('live')
        localStorage.setItem(CACHE_KEY, JSON.stringify(live))
      } catch (err) {
        console.warn('Using offline content:', err)
      }
    }
    // Pages left open (e.g. on event day) pick up admin changes without a reload.
    const onVisible = () => document.visibilityState === 'visible' && refresh()

    loadSiteConfig().then(({ contentApiUrl }) => {
      if (!contentApiUrl || cancelled) return
      apiUrl = contentApiUrl
      refresh()
      timer = window.setInterval(refresh, REFRESH_MS)
      document.addEventListener('visibilitychange', onVisible)
    })
    return () => {
      cancelled = true
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return { content, source }
}
