import { CalendarDays, ChevronDown, Clock, MapPin, Navigation } from 'lucide-react'
import type { Faq, Settings } from '../../content/types'
import { formatDate, formatTime } from '../../lib/time'
import { ExternalLink, SectionHeading } from '../components/ui'

export function Visit({ settings, faqs }: { settings: Settings; faqs: Faq[] }) {
  const shown = faqs.filter((f) => f.visible)
  const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(settings.venueAddress)}&output=embed`
  return (
    <section id="visit" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading kicker="Visit" title="Plan your visit" />

        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="card-glass flex flex-col p-6 sm:p-8">
            <ul className="space-y-5">
              <li className="flex gap-4">
                <CalendarDays className="mt-1 size-6 shrink-0 text-haldi-300" />
                <span>
                  <span className="block font-display text-xl font-bold">
                    {formatDate(settings, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="text-ivory/70">One day only</span>
                </span>
              </li>
              <li className="flex gap-4">
                <Clock className="mt-1 size-6 shrink-0 text-haldi-300" />
                <span>
                  <span className="block font-display text-xl font-bold">
                    {formatTime(settings.startTime)} – {formatTime(settings.endTime)}
                  </span>
                  <span className="text-ivory/70">Arrive any time after your ticket's entry slot</span>
                </span>
              </li>
              <li className="flex gap-4">
                <MapPin className="mt-1 size-6 shrink-0 text-haldi-300" />
                <span>
                  <span className="block font-display text-xl font-bold">{settings.venueName}</span>
                  <span className="text-ivory/70">{settings.venueAddress}</span>
                </span>
              </li>
            </ul>
            <ExternalLink href={settings.mapUrl} className="btn-gold mt-8 self-start">
              <Navigation className="size-5" /> Get directions
            </ExternalLink>
          </div>

          <div className="overflow-hidden rounded-3xl ring-1 ring-white/10">
            <iframe
              title={`Map of ${settings.venueName}`}
              src={mapEmbed}
              className="h-full min-h-80 w-full grayscale-[30%] invert-[90%] hue-rotate-180"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {shown.length > 0 && (
          <div className="mx-auto mt-16 max-w-3xl">
            <h3 className="mb-6 text-center text-3xl font-extrabold">Good to know</h3>
            <div className="space-y-3">
              {shown.map((f) => (
                <details key={f.id} className="group card-glass overflow-hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 font-display text-lg font-bold">
                    {f.question}
                    <ChevronDown className="size-5 shrink-0 text-haldi-300 transition group-open:rotate-180" />
                  </summary>
                  <p className="px-6 pb-5 leading-relaxed text-ivory/75">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
