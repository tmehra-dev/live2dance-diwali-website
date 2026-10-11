import { HandHeart, Users } from 'lucide-react'
import type { Settings } from '../../content/types'
import type { EventPhase } from '../../lib/time'
import { Diya } from '../components/Decor'
import { TicketButton } from '../components/Nav'
import { ExternalLink } from '../components/ui'

export function Give({ settings, phase }: { settings: Settings; phase: EventPhase }) {
  return (
    <section id="give" className="relative overflow-hidden bg-gradient-to-b from-night-800 to-night-900 py-20 sm:py-28">
      <div className="absolute top-1/2 left-1/2 -z-0 size-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-haldi-500/10 blur-3xl" aria-hidden />
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <Diya size={96} className="mx-auto" />
        <p className="kicker mt-4">Give</p>
        <h2 className="mt-1 text-4xl leading-tight font-extrabold sm:text-5xl">{settings.causeHeadline}</h2>
        <p className="mt-6 text-lg leading-relaxed text-ivory/80">{settings.causeText}</p>
        <p className="mt-6 font-display text-xl font-bold text-haldi-300">One Celebration. One Community. One Cause.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <TicketButton settings={settings} phase={phase} label="Buy a ticket, give more" />
          {settings.donateUrl && (
            <ExternalLink href={settings.donateUrl} className="btn-gold">
              <HandHeart className="size-5" /> Donate
            </ExternalLink>
          )}
          {settings.volunteerUrl && (
            <ExternalLink href={settings.volunteerUrl} className="btn-ghost">
              <Users className="size-5" /> Volunteer with us
            </ExternalLink>
          )}
        </div>
      </div>
    </section>
  )
}
