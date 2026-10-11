import { useMemo, useState } from 'react'
import type { Performance, PerformanceType, Settings } from '../../content/types'
import { formatTime, stageStatus, type EventPhase } from '../../lib/time'
import { ExternalLink, InstagramIcon, PERFORMANCE_TYPES, SectionHeading } from '../components/ui'

const TEASER_TYPES: PerformanceType[] = ['dance', 'singing', 'band', 'standup']

function ComingSoon({ settings }: { settings: Settings }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TEASER_TYPES.map((type, i) => {
          const meta = PERFORMANCE_TYPES[type]
          const Icon = meta.icon
          return (
            <div key={type} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-night-800 p-6">
              <div className={`absolute -top-16 -right-16 size-44 rounded-full bg-gradient-to-br opacity-30 blur-2xl ${meta.accent}`} />
              <span className={`relative grid size-14 place-items-center rounded-2xl bg-gradient-to-br text-night-900 ${meta.accent}`}>
                <Icon className="size-7" />
              </span>
              <p className="relative mt-5 font-display text-2xl font-bold">{meta.label}</p>
              <div className="relative mt-4 space-y-2" aria-hidden>
                <div className="h-3 w-4/5 animate-pulse rounded-full bg-white/10" style={{ animationDelay: `${i * 0.2}s` }} />
                <div className="h-3 w-3/5 animate-pulse rounded-full bg-white/10" style={{ animationDelay: `${i * 0.2 + 0.1}s` }} />
              </div>
              <p className="relative mt-5 text-xs font-bold tracking-[0.25em] text-haldi-300 uppercase">Reveal coming soon</p>
            </div>
          )
        })}
      </div>
      <div className="mt-10 text-center">
        <p className="mx-auto max-w-xl text-ivory/75">{settings.lineupTeaser}</p>
        <ExternalLink href={settings.instagramLive2Dance} className="btn-ghost mt-5">
          <InstagramIcon className="size-5" /> Follow for the lineup reveal
        </ExternalLink>
      </div>
    </>
  )
}

function PerformanceCard({ p, badge }: { p: Performance; badge?: 'now' | 'next' }) {
  const meta = PERFORMANCE_TYPES[p.type]
  const Icon = meta.icon
  return (
    <article
      className={`relative flex gap-4 overflow-hidden rounded-3xl border bg-night-800 p-4 sm:p-5 ${badge === 'now' ? 'border-haldi-300 shadow-[0_0_40px_-10px] shadow-haldi-500/60' : 'border-white/10'}`}
    >
      <div className={`relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br text-night-900 sm:size-24 ${meta.accent}`}>
        {p.image ? <img src={p.image} alt="" className="absolute inset-0 size-full object-cover" loading="lazy" /> : <Icon className="size-9" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${meta.chip}`}>{meta.label}</span>
          {badge === 'now' && <span className="rounded-full bg-haldi-500 px-2.5 py-0.5 text-xs font-extrabold text-night-900 uppercase">On stage now</span>}
          {badge === 'next' && <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold text-ivory uppercase">Up next</span>}
          {p.stage && <span className="text-xs text-ivory/60">{p.stage}</span>}
        </div>
        <h3 className="mt-1.5 font-display text-xl leading-tight font-bold sm:text-2xl">{p.title}</h3>
        {p.performer && <p className="text-sm font-semibold text-haldi-300">{p.performer}</p>}
        {p.description && <p className="mt-1 text-sm leading-relaxed text-ivory/70">{p.description}</p>}
        {p.link && (
          <ExternalLink href={p.link} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-peacock-300 hover:underline">
            Follow {p.performer ?? 'them'} →
          </ExternalLink>
        )}
      </div>
    </article>
  )
}

export function Watch({ settings, performances, phase, now }: { settings: Settings; performances: Performance[]; phase: EventPhase; now: Date | null }) {
  const visible = performances.filter((p) => p.visible)
  const [filter, setFilter] = useState<PerformanceType | 'all'>('all')
  const types = useMemo(() => [...new Set(visible.map((p) => p.type))], [visible])
  const shown = filter === 'all' ? visible : visible.filter((p) => p.type === filter)
  const { current, next } = phase === 'live' && now ? stageStatus(visible, settings, now) : { current: undefined, next: undefined }

  return (
    <section id="watch" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading kicker="Watch" title="Live on the Mela stage">
          Dance, music, bands and laughs: an afternoon of Seattle's best talent, all on one stage.
        </SectionHeading>

        {visible.length === 0 ? (
          <ComingSoon settings={settings} />
        ) : (
          <>
            {types.length > 1 && (
              <div className="mb-8 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Filter by type">
                {(['all', ...types] as const).map((t) => {
                  const active = filter === t
                  const label = t === 'all' ? 'All acts' : PERFORMANCE_TYPES[t].label
                  return (
                    <button
                      key={t}
                      role="tab"
                      aria-selected={active}
                      onClick={() => setFilter(t)}
                      className={`rounded-full px-4 py-2 font-display font-semibold transition ${active ? 'bg-haldi-500 text-night-900' : 'bg-white/5 text-ivory/80 hover:bg-white/10'}`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            )}
            <ol className="relative space-y-4 sm:ml-36">
              <span className="absolute top-2 bottom-2 -left-6 hidden w-px bg-gradient-to-b from-haldi-300/60 via-rani-500/40 to-transparent sm:block" aria-hidden />
              {shown.map((p) => (
                <li key={p.id} className="relative">
                  {p.start && (
                    <span className="mb-1 block font-display text-lg font-bold text-haldi-300 sm:absolute sm:top-5 sm:-left-36 sm:mb-0 sm:w-24 sm:text-right">
                      {formatTime(p.start)}
                    </span>
                  )}
                  <span className="absolute top-7 -left-[1.875rem] hidden size-3 rounded-full bg-haldi-300 ring-4 ring-night-900 sm:block" aria-hidden />
                  <PerformanceCard p={p} badge={current?.id === p.id ? 'now' : next?.id === p.id ? 'next' : undefined} />
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </section>
  )
}
