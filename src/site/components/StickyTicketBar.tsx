import { useEffect, useState } from 'react'
import type { Settings } from '../../content/types'
import { formatDate, type EventPhase } from '../../lib/time'
import { TicketButton } from './Nav'

/** Phone-only bar that keeps "Get Tickets" one tap away once the hero scrolls out of view. */
export function StickyTicketBar({ settings, phase }: { settings: Settings; phase: EventPhase }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const hero = document.getElementById('top')
    if (!hero) return
    const observer = new IntersectionObserver(([entry]) => setShow(!entry.isIntersecting), { rootMargin: '-40% 0px 0px 0px' })
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  if (phase === 'after' || settings.soldOut || !settings.ticketsOpen) return null

  return (
    <div
      className={`fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-3 rounded-full border border-white/10 bg-night-900/90 py-2 pr-2 pl-5 shadow-2xl shadow-night-950 backdrop-blur-md transition duration-300 sm:hidden ${show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-24 opacity-0'}`}
    >
      <span className="text-sm leading-tight">
        <span className="block font-display font-bold text-haldi-300">{formatDate(settings, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        <span className="text-ivory/70">from ${settings.ticketMinimum} · kids under {settings.kidsFreeUnder} free</span>
      </span>
      <TicketButton settings={settings} phase={phase} label="Tickets" className="!px-5 !py-3 !text-base" />
    </div>
  )
}
