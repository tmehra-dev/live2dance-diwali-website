import type { Settings } from '../../content/types'
import { eventInstant } from '../../lib/time'

export function Countdown({ settings, now }: { settings: Settings; now: Date | null }) {
  const target = eventInstant(settings, settings.startTime).getTime()
  const diff = now ? Math.max(0, target - now.getTime()) : null
  const parts = [
    { label: 'Days', value: diff === null ? null : Math.floor(diff / 86_400_000) },
    { label: 'Hours', value: diff === null ? null : Math.floor(diff / 3_600_000) % 24 },
    { label: 'Mins', value: diff === null ? null : Math.floor(diff / 60_000) % 60 },
    { label: 'Secs', value: diff === null ? null : Math.floor(diff / 1000) % 60 },
  ]
  return (
    <div className="flex justify-center gap-2.5 sm:gap-4" role="timer" aria-label="Countdown to the Mela">
      {parts.map((p) => (
        <div key={p.label} className="bulb-frame w-[5.2rem] sm:w-28">
          <div className="rounded-[1.5rem] bg-night-800 px-2 pt-4 pb-3 text-center">
            <div className="font-display text-3xl leading-none font-extrabold text-haldi-300 tabular-nums sm:text-[2.6rem]">
              {p.value === null ? '--' : String(p.value).padStart(2, '0')}
            </div>
            <div className="mt-1 text-[0.7rem] font-semibold tracking-[0.2em] text-ivory/70 uppercase">{p.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
