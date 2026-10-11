import { useEffect, useState } from 'react'
import { Menu, Ticket, X } from 'lucide-react'
import type { Section, Settings } from '../../content/types'
import type { EventPhase } from '../../lib/time'
import { ExternalLink } from './ui'

export function AnnouncementBar({ settings }: { settings: Settings }) {
  if (!settings.announcement) return null
  const body = <span className="font-semibold">{settings.announcement}</span>
  return (
    <div className="bg-gradient-to-r from-rani-600 via-marigold-500 to-rani-600 px-4 py-2 text-center text-sm text-white">
      {settings.announcementLink ? (
        <a href={settings.announcementLink} className="underline-offset-4 hover:underline">
          {body} <span aria-hidden>→</span>
        </a>
      ) : (
        body
      )}
    </div>
  )
}

export function TicketButton({ settings, phase, className = '', label }: { settings: Settings; phase: EventPhase; className?: string; label?: string }) {
  if (phase === 'after') return null
  if (settings.soldOut || !settings.ticketsOpen) {
    return (
      <span className={`btn cursor-not-allowed bg-white/10 text-ivory/70 ${className}`} aria-disabled>
        <Ticket className="size-5" /> {settings.soldOut ? 'Sold out' : 'Tickets closed'}
      </span>
    )
  }
  return (
    <ExternalLink href={settings.ticketUrl} className={`btn-primary ${className}`}>
      <Ticket className="size-5" />
      {label ?? `Get Tickets · from $${settings.ticketMinimum}`}
    </ExternalLink>
  )
}

export function Nav({ sections, settings, phase }: { sections: Section[]; settings: Settings; phase: EventPhase }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = sections.filter((s) => s.visible)

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${scrolled || open ? 'bg-night-900/85 shadow-lg shadow-night-950/40 backdrop-blur-md' : 'bg-transparent'}`}
    >
      <AnnouncementBar settings={settings} />
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:h-20 sm:px-6" aria-label="Main">
        <a href="#top" className="shrink-0" onClick={() => setOpen(false)}>
          <img src="media/logo-diwali-480.png" alt={settings.eventName} className="h-11 w-auto sm:h-14" width={480} height={320} />
        </a>
        <ul className="ml-auto hidden items-center gap-1 lg:flex">
          {links.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="rounded-full px-3 py-2 font-display text-[1.05rem] font-semibold text-ivory/85 transition hover:bg-white/10 hover:text-haldi-300">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <TicketButton settings={settings} phase={phase} label="Tickets" className="ml-auto hidden !px-5 !py-2.5 !text-base sm:inline-flex lg:ml-2" />
        <button
          type="button"
          className="ml-auto rounded-full p-2 text-ivory hover:bg-white/10 sm:ml-0 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="size-7" /> : <Menu className="size-7" />}
        </button>
      </nav>
      {open && (
        <div id="mobile-menu" className="border-t border-white/10 bg-night-900/95 px-4 pt-2 pb-6 lg:hidden">
          <ul className="grid grid-cols-2 gap-2">
            {links.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl bg-white/5 px-4 py-3 font-display text-lg font-semibold hover:bg-white/10"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <TicketButton settings={settings} phase={phase} className="mt-4 w-full" />
        </div>
      )}
    </header>
  )
}
