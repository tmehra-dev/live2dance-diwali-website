import { bakedContent } from '../content/defaults'
import type { Settings, SiteContent } from '../content/types'
import { CACHE_KEY, normalizeContent } from '../lib/content'

export type TableKey = 'sections' | 'vendors' | 'performances' | 'activities' | 'faqs'

export const TABLE_TABS: Record<TableKey, string> = {
  sections: 'Sections',
  vendors: 'Vendors',
  performances: 'Performances',
  activities: 'Activities',
  faqs: 'FAQ',
}

export interface HistoryEntry {
  row: number
  savedAt: string
  user: string
  tab: string
}

export interface ExternalSheet {
  headers: string[]
  rows: Record<string, string>[]
  dropped: string[]
}

export interface Backend {
  mode: 'live' | 'preview'
  load(): Promise<{ content: SiteContent; initialised: boolean }>
  saveSettings(settings: Settings): Promise<void>
  saveTable(table: TableKey, rows: object[]): Promise<void>
  uploadImage(file: File): Promise<string>
  history(): Promise<HistoryEntry[]>
  restore(row: number): Promise<void>
  readSheet(url: string): Promise<ExternalSheet>
}

async function resizeImage(file: File, max = 900): Promise<{ dataUrl: string; mimeType: string }> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
  return { dataUrl: canvas.toDataURL(mimeType, 0.86), mimeType }
}

export class LiveBackend implements Backend {
  mode = 'live' as const
  private url: string
  private getToken: () => string | null
  private onAuthError: () => void

  constructor(url: string, getToken: () => string | null, onAuthError: () => void) {
    this.url = url
    this.getToken = getToken
    this.onAuthError = onAuthError
  }

  private async call<T>(action: string, payload: object = {}): Promise<T> {
    const res = await fetch(this.url, {
      method: 'POST',
      // text/plain keeps this a "simple" request; Apps Script can't answer CORS preflights.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ token: this.getToken(), action, payload }),
    })
    const body = await res.json()
    if (body.error) {
      if (/sign in|session has expired/i.test(body.error)) this.onAuthError()
      throw new Error(body.error)
    }
    return body as T
  }

  async logout() {
    await this.call('logout').catch(() => undefined)
  }

  async changePassword(current: string, next: string) {
    await this.call('changePassword', { current, next })
  }

  async load() {
    const raw = await this.call<Partial<Record<keyof SiteContent, unknown>>>('getAll')
    const initialised = Object.keys((raw.settings as object) ?? {}).length > 0
    return { content: normalizeContent(initialised ? raw : { ...bakedContent, ...stripEmpty(raw) }), initialised }
  }

  async saveSettings(settings: Settings) {
    await this.call('saveSettings', { settings })
  }

  async saveTable(table: TableKey, rows: object[]) {
    await this.call('saveTable', { tab: TABLE_TABS[table], rows })
  }

  async uploadImage(file: File) {
    const { dataUrl, mimeType } = await resizeImage(file)
    const { url } = await this.call<{ url: string }>('uploadImage', { name: file.name, mimeType, dataBase64: dataUrl.split(',')[1] })
    return url
  }

  async history() {
    return (await this.call<{ entries: HistoryEntry[] }>('history')).entries
  }

  async restore(row: number) {
    await this.call('restore', { row })
  }

  readSheet(url: string) {
    return this.call<ExternalSheet>('readSheet', { url })
  }
}

function stripEmpty(raw: Partial<Record<keyof SiteContent, unknown>>) {
  return Object.fromEntries(Object.entries(raw).filter(([, v]) => !(Array.isArray(v) && v.length === 0)))
}

/** Works before the Google Sheet exists: saves to this browser only, and the public site in the same browser shows it. */
export class PreviewBackend implements Backend {
  mode = 'preview' as const

  private read(): SiteContent {
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (raw) return normalizeContent(JSON.parse(raw))
    } catch {
      // fall through to the built-in content
    }
    return bakedContent
  }

  private write(patch: Partial<SiteContent>) {
    const next = { ...this.read(), ...patch, updatedAt: new Date().toISOString() }
    localStorage.setItem(CACHE_KEY, JSON.stringify(next))
  }

  async load() {
    return { content: this.read(), initialised: true }
  }

  async saveSettings(settings: Settings) {
    this.write({ settings })
  }

  async saveTable(table: TableKey, rows: object[]) {
    this.write({ [table]: rows } as Partial<SiteContent>)
  }

  async uploadImage(file: File) {
    return (await resizeImage(file, 600)).dataUrl
  }

  async history() {
    return []
  }

  async restore() {
    throw new Error('History is only available once the Google Sheet is connected.')
  }

  async readSheet(): Promise<ExternalSheet> {
    throw new Error('Reading a Google Sheet link needs the Sheet backend. Upload a CSV file instead.')
  }

  reset() {
    localStorage.removeItem(CACHE_KEY)
  }
}
