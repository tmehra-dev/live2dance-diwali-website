import { Baby, HandHeart, Heart, Hourglass, Ticket } from 'lucide-react'
import type { Settings } from '../../content/types'
import { entrySlots, formatTime, type EventPhase } from '../../lib/time'
import { TicketButton } from '../components/Nav'
import { ExternalLink, SectionHeading } from '../components/ui'

export function Tickets({ settings, phase }: { settings: Settings; phase: EventPhase }) {
  const slots = entrySlots(settings)
  const bookable = settings.ticketsOpen && !settings.soldOut && phase !== 'after'
  const facts = [
    { icon: Ticket, title: `$${settings.ticketMinimum} minimum`, body: 'per person, per ticket' },
    { icon: Baby, title: `Under ${settings.kidsFreeUnder} free`, body: 'little ones get in free' },
    { icon: HandHeart, title: 'Give more', body: '$25, $100 or more: no limit' },
    { icon: Hourglass, title: `Stay till ${formatTime(settings.endTime)}`, body: 'whatever time you arrive' },
  ]

  return (
    <section id="tickets" className="relative bg-night-800 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading kicker="Your ticket is your support" title="Pick your arrival time">
          Entry starts at just ${settings.ticketMinimum} per person, and you can choose to give more. Every
          contribution helps {settings.presenter} continue its nonprofit work in our community. So pick your
          ticket, bring your people, and come make your Diwali count.
        </SectionHeading>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map(({ icon: Icon, title, body }) => (
            <div key={title} className="card-glass flex items-center gap-4 p-5">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-haldi-500 to-marigold-600 text-night-900">
                <Icon className="size-6" />
              </span>
              <span>
                <span className="block font-display text-xl font-bold">{title}</span>
                <span className="text-sm text-ivory/70">{body}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="bulb-frame mt-10">
          <div className="rounded-[1.5rem] bg-night-900 px-5 py-10 sm:px-10">
            <p className="text-center font-display text-2xl font-bold">When will you arrive?</p>
            <p className="mt-1 text-center text-ivory/70">
              Choose the entry time that matches your arrival. You can enter at or after the time on your ticket.
            </p>

            <ol className="relative mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-[repeat(var(--n),minmax(0,1fr))_auto] lg:gap-0" style={{ ['--n' as string]: slots.length }}>
              <span className="absolute top-7 right-8 left-8 hidden h-1 rounded-full bg-gradient-to-r from-haldi-500 via-rani-500 to-peacock-500 lg:block" aria-hidden />
              {slots.map((slot, i) => {
                const body = (
                  <>
                    <span className="relative z-10 grid size-14 place-items-center rounded-full border-4 border-night-900 bg-gradient-to-br from-haldi-300 to-marigold-500 font-display text-lg font-extrabold text-night-900 shadow-[0_0_24px] shadow-haldi-500/40 transition group-hover:scale-110">
                      {formatTime(slot).replace(' PM', '').replace(' AM', '')}
                    </span>
                    <span className="mt-3 font-display text-lg font-bold">{formatTime(slot)}</span>
                    <span className="text-sm text-ivory/60">{i === 0 ? 'Doors open' : 'onwards'}</span>
                  </>
                )
                return (
                  <li key={slot} className="flex justify-center">
                    {bookable ? (
                      <ExternalLink href={settings.ticketUrl} className="group flex flex-col items-center rounded-2xl p-2 text-center" aria-label={`Get a ${formatTime(slot)} onwards entry ticket`}>
                        {body}
                      </ExternalLink>
                    ) : (
                      <div className="group flex flex-col items-center p-2 text-center opacity-70">{body}</div>
                    )}
                  </li>
                )
              })}
              <li className="col-span-2 flex justify-center sm:col-span-3 lg:col-span-1">
                <div className="flex flex-col items-center p-2 text-center">
                  <span className="relative z-10 grid size-14 place-items-center rounded-full border-4 border-night-900 bg-peacock-500 text-night-900">
                    <Heart className="size-6 fill-current" />
                  </span>
                  <span className="mt-3 font-display text-lg font-bold">{formatTime(settings.endTime)}</span>
                  <span className="text-sm text-ivory/60">Mela wraps up</span>
                </div>
              </li>
            </ol>

            <div className="mt-10 flex flex-col items-center gap-3">
              <TicketButton settings={settings} phase={phase} className="!px-8 !py-4 !text-xl" />
              <p className="text-sm text-ivory/60">Tickets are sold securely through TicketLeap.</p>
            </div>
          </div>
        </div>

        <details className="group mx-auto mt-8 max-w-3xl text-sm text-ivory/60">
          <summary className="cursor-pointer list-none text-center font-semibold text-ivory/75 hover:text-haldi-300">
            Charitable contribution notice <span className="inline-block transition group-open:rotate-180">⌄</span>
          </summary>
          <p className="mt-3 leading-relaxed">{settings.charityNotice}</p>
        </details>
      </div>
    </section>
  )
}
