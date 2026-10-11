import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import {
  CalendarClock,
  ExternalLink as ExternalIcon,
  FileUp,
  History,
  KeyRound,
  LayoutDashboard,
  LayoutList,
  LogOut,
  Mic2,
  Settings2,
  Store,
  Sparkles,
  CircleHelp,
} from 'lucide-react'
import type { Activity, Faq, Performance, Section, SiteContent, Vendor } from '../content/types'
import { loadSiteConfig } from '../lib/content'
import { eventPhase, formatTime } from '../lib/time'
import { LiveBackend, PreviewBackend, type Backend, type HistoryEntry, type TableKey } from './api'
import { clearSession, requestLogin, storeSession, storedSession, type Session } from './auth'
import { Button, Card, FieldInput, Modal, Toggle } from './components'
import { activityEditFields, faqEditFields, performanceEditFields, settingsGroups, vendorEditFields } from './fields'
import { ImportWizard } from './ImportWizard'
import { ListEditor } from './ListEditor'

type Area = 'settings' | TableKey
type Page = 'dashboard' | 'sections' | 'vendors' | 'performances' | 'activities' | 'faqs' | 'history' | `settings:${string}`

const AREA_LABELS: Record<Area, string> = {
  settings: 'Settings',
  sections: 'Sections',
  vendors: 'Vendors',
  performances: 'Performances',
  activities: 'Activities',
  faqs: 'FAQ',
}

const NAV: { page: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ...settingsGroups.slice(1).map((g) => ({ page: `settings:${g.id}` as Page, label: g.title.replace(/ \(.*\)/, ''), icon: Settings2 })),
  { page: 'sections', label: 'Page sections', icon: LayoutList },
  { page: 'vendors', label: 'Vendors', icon: Store },
  { page: 'performances', label: 'Performances', icon: Mic2 },
  { page: 'activities', label: 'Activities', icon: Sparkles },
  { page: 'faqs', label: 'FAQ', icon: CircleHelp },
  { page: 'history', label: 'History', icon: History },
]

function areaOf(page: Page): Area | null {
  if (page.startsWith('settings:')) return 'settings'
  if (page === 'dashboard') return 'settings'
  if (page === 'history') return null
  return page as TableKey
}

export function AdminApp() {
  const [stage, setStage] = useState<'loading' | 'setup' | 'signin' | 'ready'>('loading')
  const [backend, setBackend] = useState<Backend | null>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [apiUrl, setApiUrl] = useState('')
  const token = useRef<string | null>(null)

  useEffect(() => {
    loadSiteConfig().then(({ contentApiUrl }) => {
      setApiUrl(contentApiUrl)
      if (!contentApiUrl) return setStage('setup')
      const session = storedSession()
      token.current = session?.token ?? null
      setName(session?.name ?? '')
      setStage(session ? 'ready' : 'signin')
    })
  }, [])

  const signOut = useCallback(async () => {
    if (backend instanceof LiveBackend) await backend.logout()
    clearSession()
    token.current = null
    setBackend(null)
    setStage('signin')
  }, [backend])

  const onSession = useCallback((session: Session) => {
    storeSession(session)
    token.current = session.token
    setName(session.name)
    setError('')
    setBackend(null)
    setStage('ready')
  }, [])

  useEffect(() => {
    if (stage === 'ready' && apiUrl && !backend) {
      setBackend(
        new LiveBackend(apiUrl, () => token.current, () => {
          clearSession()
          setError('Your session ended. Please sign in again.')
          setBackend(null)
          setStage('signin')
        }),
      )
    }
  }, [stage, apiUrl, backend])

  return (
    <div className="min-h-screen bg-[#f4eff8] font-sans text-night-900">
      {stage === 'loading' && <p className="p-10 text-center">Loading…</p>}
      {stage === 'setup' && (
        <SetupScreen
          onPreview={() => {
            setBackend(new PreviewBackend())
            setStage('ready')
          }}
        />
      )}
      {stage === 'signin' && <SignIn apiUrl={apiUrl} error={error} onSession={onSession} />}
      {stage === 'ready' && backend && <Dashboard backend={backend} email={name} onSignOut={signOut} authError={error} />}
    </div>
  )
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-night-800 via-night-700 to-rani-700 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-night-900 shadow-2xl">
        <img src="media/logo-diwali-480.png" alt="Live2Dance Waali Diwali" className="mx-auto h-24" />
        {children}
      </div>
    </div>
  )
}

function SignIn({ apiUrl, error, onSession }: { apiUrl: string; error: string; onSession: (s: Session) => void }) {
  const [password, setPassword] = useState('')
  const [who, setWho] = useState(() => localStorage.getItem('l2d-admin-name') ?? '')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      localStorage.setItem('l2d-admin-name', who)
      onSession(await requestLogin(apiUrl, password, who))
    } catch (err) {
      setMessage((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <Shell>
      <h1 className="mt-4 text-center font-display text-2xl font-bold">Website admin</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1 block font-semibold">Your name</span>
          <input
            className="w-full rounded-xl border border-night-900/15 px-3 py-2.5"
            value={who}
            onChange={(e) => setWho(e.target.value)}
            placeholder="So the change history shows who saved what"
            autoComplete="name"
          />
        </label>
        <label className="block">
          <span className="mb-1 block font-semibold">Admin password</span>
          <input
            className="w-full rounded-xl border border-night-900/15 px-3 py-2.5"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            autoFocus
            required
          />
        </label>
        <Button type="submit" busy={busy} disabled={!password} className="w-full !py-3 !text-base">
          Sign in
        </Button>
      </form>
      {(message || error) && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-800">{message || error}</p>}
      <p className="mt-6 text-center text-sm">
        <a href="./" className="text-rani-600 hover:underline">
          ← Back to the website
        </a>
      </p>
    </Shell>
  )
}

function SetupScreen({ onPreview }: { onPreview: () => void }) {
  return (
    <Shell>
      <h1 className="mt-4 text-center font-display text-2xl font-bold">Connect the content Sheet</h1>
      <p className="mt-2 text-night-700/80">
        The admin saves to a Google Sheet through a small Apps Script. Put the script's web-app URL in{' '}
        <code className="rounded bg-night-900/5 px-1">site-config.json</code> next to index.html (see the README) and this page will ask for the admin password.
      </p>
      <div className="mt-6 rounded-2xl bg-haldi-100 p-4 text-sm">
        <p className="font-semibold">Want to look around first?</p>
        <p className="mt-1 text-night-700/80">Preview mode works without the Sheet. Changes are saved only in this browser, and the website in this same browser will show them.</p>
        <Button className="mt-3" onClick={onPreview}>
          Open preview mode
        </Button>
      </div>
    </Shell>
  )
}

function Dashboard({ backend, email, onSignOut, authError }: { backend: Backend; email: string; onSignOut: () => void; authError: string }) {
  const [saved, setSaved] = useState<SiteContent | null>(null)
  const [draft, setDraft] = useState<SiteContent | null>(null)
  const [initialised, setInitialised] = useState(true)
  const [page, setPage] = useState<Page>('dashboard')
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const [importing, setImporting] = useState<'vendors' | 'performances' | null>(null)
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    backend
      .load()
      .then(({ content, initialised }) => {
        setSaved(content)
        setDraft(content)
        setInitialised(initialised)
      })
      .catch((e) => setError(e.message))
  }, [backend])

  const dirty = useMemo(() => {
    if (!saved || !draft) return [] as Area[]
    return (Object.keys(AREA_LABELS) as Area[]).filter((a) => JSON.stringify(saved[a]) !== JSON.stringify(draft[a]))
  }, [saved, draft])

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty.length) e.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const flash = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(''), 3500)
  }

  const publish = async (areas: Area[]) => {
    if (!draft) return
    setBusy(true)
    setError('')
    try {
      for (const area of areas) {
        if (area === 'settings') await backend.saveSettings(draft.settings)
        else await backend.saveTable(area, draft[area] as object[])
      }
      setSaved((s) => (s ? { ...s, ...Object.fromEntries(areas.map((a) => [a, draft[a]])) } : s))
      setInitialised(true)
      flash(backend.mode === 'live' ? 'Published! It’s live on the website now.' : 'Saved in this browser.')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (error && !draft) return <p className="p-10 text-center text-red-700">{error}</p>
  if (!draft || !saved) return <p className="p-10 text-center">Loading content…</p>

  const set = <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => setDraft({ ...draft, [key]: value })
  const setSetting = (key: string, value: unknown) => set('settings', { ...draft.settings, [key]: value })
  const upload = (f: File) => backend.uploadImage(f)
  const area = areaOf(page)

  return (
    <div className="lg:flex">
      <aside className="border-b border-night-900/10 bg-night-900 text-ivory lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0">
        <div className="flex items-center gap-3 px-5 py-4">
          <img src="media/logo-diwali-480.png" alt="" className="h-12" />
          <div className="leading-tight">
            <p className="font-display font-bold">Website admin</p>
            <p className="text-xs text-ivory/60">{backend.mode === 'preview' ? 'Preview mode' : email}</p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
          {NAV.map(({ page: p, label, icon: Icon }) => {
            const a = areaOf(p)
            const isDirty = a && a !== 'settings' ? dirty.includes(a) : false
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${page === p ? 'bg-white/15 text-white' : 'text-ivory/70 hover:bg-white/5 hover:text-white'}`}
              >
                <Icon className="size-4" />
                {label}
                {isDirty && <span className="ml-auto size-2 rounded-full bg-haldi-500" aria-label="unsaved" />}
              </button>
            )
          })}
        </nav>
        <div className="hidden px-3 pt-4 lg:block">
          <a href="./" target="_blank" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ivory/70 hover:bg-white/5 hover:text-white">
            <ExternalIcon className="size-4" /> View website
          </a>
          {backend instanceof LiveBackend && (
            <>
              <button type="button" onClick={() => setChangingPassword(true)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-ivory/70 hover:bg-white/5 hover:text-white">
                <KeyRound className="size-4" /> Change password
              </button>
              <button type="button" onClick={onSignOut} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-ivory/70 hover:bg-white/5 hover:text-white">
                <LogOut className="size-4" /> Sign out
              </button>
            </>
          )}
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8">
        {backend.mode === 'preview' && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-haldi-100 px-4 py-3 text-sm">
            <span>
              <strong>Preview mode:</strong> changes are saved only in this browser. Open the website here to see them.
            </span>
            <Button
              variant="secondary"
              onClick={() => {
                if (!window.confirm('Discard all preview changes?')) return
                ;(backend as PreviewBackend).reset()
                window.location.reload()
              }}
            >
              Reset preview
            </Button>
          </div>
        )}
        {!initialised && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-peacock-500/15 px-4 py-3 text-sm">
            <span>
              <strong>Your Sheet is empty.</strong> Publish once to copy the website's current content into it.
            </span>
            <Button busy={busy} onClick={() => publish(Object.keys(AREA_LABELS) as Area[])}>
              Fill the Sheet
            </Button>
          </div>
        )}
        {(error || authError) && <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{error || authError}</p>}

        <div className="sticky top-0 z-30 -mx-4 mb-6 flex flex-wrap items-center justify-between gap-3 bg-[#f4eff8]/90 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
          <h1 className="font-display text-2xl font-bold">{NAV.find((n) => n.page === page)?.label}</h1>
          <div className="flex items-center gap-2">
            {dirty.length > 0 && <span className="hidden text-sm text-night-700/70 sm:inline">Unsaved: {dirty.map((d) => AREA_LABELS[d]).join(', ')}</span>}
            {area && dirty.includes(area) && (
              <Button variant="secondary" onClick={() => set(area, saved[area] as never)}>
                Discard
              </Button>
            )}
            <Button busy={busy} disabled={!dirty.length} onClick={() => publish(dirty)}>
              Publish {dirty.length > 1 ? 'all changes' : 'changes'}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {page === 'dashboard' && <Overview content={draft} onSetting={setSetting} onUpload={upload} goTo={setPage} />}

          {page.startsWith('settings:') &&
            settingsGroups
              .filter((g) => `settings:${g.id}` === page)
              .map((g) => (
                <Card key={g.id} title={g.title} description={g.description}>
                  <div className="grid gap-5 md:grid-cols-2">
                    {g.fields.map((f) => (
                      <div key={f.key} className={f.type === 'textarea' || f.type === 'image' || f.type === 'bool' ? 'md:col-span-2' : ''}>
                        <FieldInput field={f} value={draft.settings[f.key]} onChange={(v) => setSetting(f.key, v)} onUpload={upload} />
                      </div>
                    ))}
                  </div>
                </Card>
              ))}

          {page === 'sections' && <SectionsEditor sections={draft.sections} onChange={(s) => set('sections', s)} />}

          {page === 'vendors' && (
            <Card
              title={`${draft.vendors.filter((v) => v.visible).length} of ${draft.vendors.length} vendors shown`}
              description="Food vendors appear under Indulge; everyone else under Shop. Contact details and permits are never stored here."
              actions={
                <Button variant="secondary" onClick={() => setImporting('vendors')}>
                  <FileUp className="size-4" /> Import CSV / Sheet
                </Button>
              }
            >
              <ListEditor<Vendor & Record<string, unknown>>
                rows={draft.vendors as (Vendor & Record<string, unknown>)[]}
                onChange={(rows) => set('vendors', rows)}
                fields={vendorEditFields}
                titleKey="name"
                imageKey="logo"
                subtitle={(v) => `${v.category}${v.featured ? ' · featured' : ''} · ${v.description}`}
                blank={() => ({ id: '', name: '', category: 'food', description: '', visible: true }) as Vendor & Record<string, unknown>}
                onUpload={upload}
                searchable
                itemLabel="vendor"
              />
            </Card>
          )}

          {page === 'performances' && (
            <Card
              title={`${draft.performances.filter((p) => p.visible).length} performances on the schedule`}
              description='Until at least one performance is shown, the Watch section displays "Lineup reveal coming soon". Acts are sorted by start time.'
              actions={
                <Button variant="secondary" onClick={() => setImporting('performances')}>
                  <FileUp className="size-4" /> Import CSV / Sheet
                </Button>
              }
            >
              <ListEditor<Performance & Record<string, unknown>>
                rows={draft.performances as (Performance & Record<string, unknown>)[]}
                onChange={(rows) => set('performances', [...rows].sort((a, b) => (a.start ?? '99').localeCompare(b.start ?? '99')))}
                fields={performanceEditFields}
                titleKey="title"
                imageKey="image"
                subtitle={(p) => [formatTime(p.start) || 'No time yet', p.type, p.performer].filter(Boolean).join(' · ')}
                blank={() => ({ id: '', title: '', type: 'dance', visible: true }) as Performance & Record<string, unknown>}
                onUpload={upload}
                searchable
                itemLabel="performance"
              />
            </Card>
          )}

          {page === 'activities' && (
            <Card title="Things to do" description="Shown in the Do section, in this order.">
              <ListEditor<Activity & Record<string, unknown>>
                rows={draft.activities as (Activity & Record<string, unknown>)[]}
                onChange={(rows) => set('activities', rows)}
                fields={activityEditFields}
                titleKey="title"
                subtitle={(a) => a.description}
                blank={() => ({ id: '', title: '', description: '', icon: 'sparkles', visible: true }) as Activity & Record<string, unknown>}
                onUpload={upload}
                reorderable
                itemLabel="activity"
              />
            </Card>
          )}

          {page === 'faqs' && (
            <Card title="Good to know" description="Questions in the Visit section, in this order.">
              <ListEditor<Faq & Record<string, unknown>>
                rows={draft.faqs as (Faq & Record<string, unknown>)[]}
                onChange={(rows) => set('faqs', rows)}
                fields={faqEditFields}
                titleKey="question"
                subtitle={(f) => f.answer}
                blank={() => ({ id: '', question: '', answer: '', visible: true }) as Faq & Record<string, unknown>}
                onUpload={upload}
                reorderable
                itemLabel="question"
              />
            </Card>
          )}

          {page === 'history' && <HistoryPage backend={backend} onRestored={() => window.location.reload()} />}
        </div>
      </main>

      {importing === 'vendors' && (
        <ImportWizard<Vendor> kind="vendors" existing={draft.vendors} backend={backend} onApply={(rows) => set('vendors', rows)} onClose={() => setImporting(null)} />
      )}
      {importing === 'performances' && (
        <ImportWizard<Performance>
          kind="performances"
          existing={draft.performances}
          backend={backend}
          onApply={(rows) => set('performances', rows)}
          onClose={() => setImporting(null)}
        />
      )}

      {changingPassword && backend instanceof LiveBackend && (
        <ChangePassword
          backend={backend}
          onClose={() => setChangingPassword(false)}
          onDone={() => {
            setChangingPassword(false)
            flash('Password changed.')
          }}
        />
      )}

      {toast && (
        <div role="status" className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-night-900 px-5 py-3 text-sm font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  )
}

function Overview({
  content,
  onSetting,
  onUpload,
  goTo,
}: {
  content: SiteContent
  onSetting: (k: string, v: unknown) => void
  onUpload: (f: File) => Promise<string>
  goTo: (p: Page) => void
}) {
  const { settings } = content
  const phase = eventPhase(settings, new Date())
  const live = settingsGroups[0]
  const stats = [
    { label: 'Vendors shown', value: `${content.vendors.filter((v) => v.visible).length}/${content.vendors.length}`, page: 'vendors' as Page },
    { label: 'Performances', value: content.performances.filter((p) => p.visible).length, page: 'performances' as Page },
    { label: 'Sections shown', value: `${content.sections.filter((s) => s.visible).length}/${content.sections.length}`, page: 'sections' as Page },
    { label: 'FAQs', value: content.faqs.filter((f) => f.visible).length, page: 'faqs' as Page },
  ]
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <button key={s.label} type="button" onClick={() => goTo(s.page)} className="rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-night-900/10 hover:ring-rani-500">
            <p className="font-display text-3xl font-extrabold text-rani-600">{s.value}</p>
            <p className="text-sm text-night-700/70">{s.label}</p>
          </button>
        ))}
      </div>
      <Card
        title="Event status"
        description={`${settings.eventDate} · ${formatTime(settings.startTime)}–${formatTime(settings.endTime)} · ${settings.venueName}`}
      >
        <p className="flex items-center gap-2 text-night-800">
          <CalendarClock className="size-5 text-peacock-700" />
          {phase === 'before' && 'The website is counting down to the Mela.'}
          {phase === 'live' && 'The website is in event-day mode: "The Mela is on now!"'}
          {phase === 'after' && 'The event is over. The website shows a thank-you message and hides ticket buttons.'}
        </p>
      </Card>
      <Card title={live.title} description={live.description}>
        <div className="grid gap-4 md:grid-cols-2">
          {live.fields.map((f) => (
            <div key={f.key} className={f.type === 'bool' ? '' : 'md:col-span-2'}>
              <FieldInput field={f} value={settings[f.key]} onChange={(v) => onSetting(f.key, v)} onUpload={onUpload} />
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}

function ChangePassword({ backend, onClose, onDone }: { backend: LiveBackend; onClose: () => void; onDone: () => void }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const mismatch = confirm.length > 0 && next !== confirm
  const save = async () => {
    setBusy(true)
    setError('')
    try {
      await backend.changePassword(current, next)
      onDone()
    } catch (e) {
      setError((e as Error).message)
      setBusy(false)
    }
  }
  const input = 'w-full rounded-xl border border-night-900/15 bg-white px-3 py-2'
  return (
    <Modal
      title="Change admin password"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button busy={busy} disabled={!current || next.length < 8 || next !== confirm} onClick={save}>
            Change password
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block font-semibold">Current password</span>
          <input className={input} type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
        </label>
        <label className="block">
          <span className="mb-1 block font-semibold">New password</span>
          <input className={input} type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
          <span className="mt-1 block text-sm text-night-700/70">At least 8 characters. Share it only with the people who edit the website.</span>
        </label>
        <label className="block">
          <span className="mb-1 block font-semibold">New password again</span>
          <input className={input} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
          {mismatch && <span className="mt-1 block text-sm text-red-700">The two new passwords don't match.</span>}
        </label>
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      </div>
    </Modal>
  )
}

function SectionsEditor({ sections, onChange }: { sections: Section[]; onChange: (s: Section[]) => void }) {
  const update = (i: number, patch: Partial<Section>) => onChange(sections.map((s, k) => (k === i ? { ...s, ...patch } : s)))
  const move = (i: number, d: number) => {
    const next = [...sections]
    const [s] = next.splice(i, 1)
    next.splice(i + d, 0, s)
    onChange(next)
  }
  return (
    <Card title="Page sections" description="Turn sections on or off, rename their menu labels, and change the order they appear in after the hero.">
      <ul className="divide-y divide-night-900/5 overflow-hidden rounded-xl ring-1 ring-night-900/10">
        {sections.map((s, i) => (
          <li key={s.id} className={`flex items-center gap-3 bg-white px-3 py-2.5 ${s.visible ? '' : 'opacity-60'}`}>
            <span className="w-20 shrink-0 text-xs font-bold tracking-wider text-night-700/50 uppercase">{s.id}</span>
            <input className="min-w-0 flex-1 rounded-lg border border-night-900/15 px-3 py-1.5" value={s.label} onChange={(e) => update(i, { label: e.target.value })} aria-label={`${s.id} menu label`} />
            <Toggle checked={s.visible} onChange={(v) => update(i, { visible: v })} label={`Show ${s.label}`} />
            <Button variant="ghost" className="!px-2" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">
              ↑
            </Button>
            <Button variant="ghost" className="!px-2" disabled={i === sections.length - 1} onClick={() => move(i, 1)} aria-label="Move down">
              ↓
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function HistoryPage({ backend, onRestored }: { backend: Backend; onRestored: () => void }) {
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<number | null>(null)
  useEffect(() => {
    backend.history().then(setEntries).catch((e) => setError(e.message))
  }, [backend])
  return (
    <Card title="Recent saves" description="Every publish first backs up the tab it changes. Restore puts that version back on the live site.">
      {error && <p className="text-sm text-red-700">{error}</p>}
      {backend.mode === 'preview' && <p className="text-night-700/70">History is kept in the Google Sheet, so it appears once the Sheet is connected.</p>}
      {entries?.length === 0 && backend.mode === 'live' && <p className="text-night-700/70">No backups yet.</p>}
      <ul className="divide-y divide-night-900/5">
        {entries?.map((e) => (
          <li key={e.row} className="flex items-center justify-between gap-3 py-2.5">
            <span>
              <strong>{e.tab}</strong> <span className="text-sm text-night-700/70">before a save by {e.user} · {new Date(e.savedAt).toLocaleString()}</span>
            </span>
            <Button
              variant="secondary"
              busy={busy === e.row}
              onClick={async () => {
                if (!window.confirm(`Restore ${e.tab} to how it was at ${new Date(e.savedAt).toLocaleString()}?`)) return
                setBusy(e.row)
                try {
                  await backend.restore(e.row)
                  onRestored()
                } catch (err) {
                  setError((err as Error).message)
                  setBusy(null)
                }
              }}
            >
              Restore
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  )
}
