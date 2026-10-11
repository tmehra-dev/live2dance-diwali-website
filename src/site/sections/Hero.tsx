import { CalendarDays, Clock, MapPin, Radio } from 'lucide-react'
import type { Performance, Settings } from '../../content/types'
import { formatDate, formatTime, stageStatus, type EventPhase } from '../../lib/time'
import { Countdown } from '../components/Countdown'
import { Burst, Lantern, Sparkle, StallSkyline, Toran } from '../components/Decor'
import { TicketButton } from '../components/Nav'

const SPARKLES = [
  { top: '22%', left: '8%', size: 16, delay: '0s', color: 'text-haldi-300' },
  { top: '34%', left: '90%', size: 22, delay: '1.1s', color: 'text-ivory' },
  { top: '58%', left: '6%', size: 12, delay: '0.6s', color: 'text-peacock-300' },
  { top: '16%', left: '74%', size: 14, delay: '2s', color: 'text-rani-300' },
  { top: '66%', left: '93%', size: 12, delay: '1.6s', color: 'text-haldi-300' },
  { top: '44%', left: '18%', size: 10, delay: '2.4s', color: 'text-ivory' },
  { top: '12%', left: '40%', size: 10, delay: '0.3s', color: 'text-ivory' },
]

export function Hero({
  settings,
  performances,
  phase,
  now,
}: {
  settings: Settings
  performances: Performance[]
  phase: EventPhase
  now: Date | null
}) {
  const { current, next } = now ? stageStatus(performances, settings, now) : { current: undefined, next: undefined }
  const onStage = settings.nowOnStage || current?.title

  return (
    <section id="top" className="relative isolate overflow-hidden pt-16 sm:pt-20">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_30%,var(--color-night-600)_0%,var(--color-night-700)_35%,var(--color-night-900)_80%)]" />
      <Toran className="absolute inset-x-0 top-16 -z-[5] opacity-95 sm:top-20" />

      <Lantern hue="rani" drop={60} className="absolute top-16 left-[4%] hidden sm:block" style={{ animationDelay: '-1s' }} />
      <Lantern hue="peacock" drop={140} className="absolute top-16 left-[13%] hidden lg:block" style={{ animationDelay: '-3s' }} />
      <Lantern hue="marigold" drop={100} className="absolute top-16 right-[5%] hidden sm:block" style={{ animationDelay: '-2s' }} />
      <Lantern hue="rani" drop={170} className="absolute top-16 right-[14%] hidden lg:block" style={{ animationDelay: '-4s' }} />

      <Burst className="absolute top-[18%] left-[22%] -z-[1] hidden md:block" style={{ animationDelay: '0s' }} color="#ff7fb4" />
      <Burst className="absolute top-[30%] right-[20%] -z-[1] hidden md:block" color="#ffe27a" style={{ animationDelay: '-2.2s' }} />
      <Burst className="absolute top-[52%] left-[10%] -z-[1] hidden md:block" color="#5fd9d6" style={{ animationDelay: '-3.6s' }} />
      {SPARKLES.map((s, i) => (
        <Sparkle key={i} size={s.size} className={`absolute ${s.color}`} style={{ top: s.top, left: s.left, animationDelay: s.delay }} />
      ))}

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 pt-24 text-center sm:pt-28">
        <p className="flex items-center gap-2 text-xs font-bold tracking-[0.3em] text-ivory/80 uppercase sm:text-sm">
          <span className="h-px w-8 bg-ivory/40" />
          {settings.presenter} presents
          <span className="h-px w-8 bg-ivory/40" />
        </p>

        <h1 className="mt-3 w-full">
          <img
            src="media/logo-diwali.webp"
            alt={settings.eventName}
            width={870}
            height={580}
            className="mx-auto w-full max-w-[620px] animate-float drop-shadow-[0_20px_50px_rgba(224,35,122,0.35)]"
            fetchPriority="high"
          />
        </h1>

        <p className="-mt-2 font-display text-2xl font-extrabold tracking-wide text-rani-300 uppercase sm:text-3xl">
          {settings.eventTagline}!
        </p>

        <ul className="mt-5 flex flex-wrap justify-center gap-2 text-sm font-semibold sm:gap-3 sm:text-base">
          <li className="card-glass flex items-center gap-2 px-4 py-2">
            <CalendarDays className="size-4 text-haldi-300" />
            {formatDate(settings, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </li>
          <li className="card-glass flex items-center gap-2 px-4 py-2">
            <Clock className="size-4 text-haldi-300" />
            {formatTime(settings.startTime)} – {formatTime(settings.endTime)}
          </li>
          <li className="card-glass flex items-center gap-2 px-4 py-2">
            <MapPin className="size-4 text-haldi-300" />
            {settings.venueName}, Seattle
          </li>
        </ul>

        <div className="mt-8 w-full">
          {phase === 'before' && <Countdown settings={settings} now={now} />}
          {phase === 'live' && (
            <div className="bulb-frame mx-auto max-w-xl">
              <div className="rounded-[1.5rem] bg-night-800 px-6 py-5">
                <p className="flex items-center justify-center gap-2 font-display text-2xl font-extrabold text-haldi-300">
                  <Radio className="size-6 animate-pulse text-rani-300" /> The Mela is on now!
                </p>
                <p className="mt-1 text-ivory/80">Come on down, we're celebrating until {formatTime(settings.endTime)}.</p>
                {onStage && (
                  <p className="mt-3 text-sm">
                    <span className="font-bold tracking-widest text-rani-300 uppercase">On stage now</span>
                    <span className="mx-2 text-ivory/40">·</span>
                    <span className="font-semibold">{onStage}</span>
                    {next && !settings.nowOnStage && (
                      <span className="block text-ivory/60">
                        Up next at {formatTime(next.start)}: {next.title}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          )}
          {phase === 'after' && (
            <div className="mx-auto max-w-xl">
              <p className="font-script text-4xl text-haldi-300">Thank you, Seattle!</p>
              <p className="mt-2 text-lg text-ivory/80">
                Thank you for bringing your light to {settings.eventName}. See you next Diwali!
              </p>
            </div>
          )}
        </div>

        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ivory/80">{settings.heroIntro}</p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <TicketButton settings={settings} phase={phase} className="!px-8 !py-4 !text-xl" />
          <a href="#visit" className="btn-ghost !py-4">
            Plan your visit
          </a>
        </div>

        <a
          href="#partner"
          className="mt-8 inline-flex items-center gap-3 rounded-full bg-ivory py-1.5 pr-5 pl-1.5 text-left text-night-900 shadow-lg shadow-night-950/40 transition hover:-translate-y-0.5"
        >
          <img src={settings.partnerLogo} alt="" className="h-10 w-14 rounded-full bg-white object-contain" width={56} height={40} />
          <span className="leading-tight">
            <span className="block text-[0.65rem] font-bold tracking-[0.2em] text-sathe-red uppercase">{settings.partnerTitle}</span>
            <span className="font-display text-lg font-bold">{settings.partnerName}</span>
          </span>
        </a>
      </div>

      <StallSkyline className="mt-14 h-28 sm:mt-20 sm:h-40" />
    </section>
  )
}
