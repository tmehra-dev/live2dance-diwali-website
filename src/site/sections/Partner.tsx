import { Mail, Phone } from 'lucide-react'
import type { Settings } from '../../content/types'
import { ExternalLink } from '../components/ui'

/** The one light section on the page, so the exclusive partner gets a distinct, premium moment. */
export function Partner({ settings }: { settings: Settings }) {
  return (
    <section id="partner" className="relative overflow-hidden bg-ivory py-20 text-night-900 sm:py-28">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20px 20px, #e0237a 3px, transparent 4px), radial-gradient(circle at 0 0, transparent 14px, #ff8a1f 15px, transparent 16px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute -inset-3 rounded-t-full rounded-b-[2.5rem] bg-gradient-to-br from-haldi-500 via-marigold-500 to-rani-500" aria-hidden />
          <div className="relative overflow-hidden rounded-t-full rounded-b-[2rem] bg-white">
            <img src={settings.partnerPhoto} alt={`The ${settings.partnerName}`} className="aspect-[4/5] w-full object-cover object-top" loading="lazy" width={712} height={890} />
          </div>
          <div className="absolute -bottom-6 left-1/2 w-max -translate-x-1/2 rounded-full bg-sathe-red px-5 py-2 text-sm font-bold tracking-[0.2em] text-white uppercase shadow-lg">
            {settings.partnerTitle}
          </div>
        </div>

        <div className="text-center lg:text-left">
          <p className="font-script text-3xl text-sathe-red">Lighting up homes this Diwali</p>
          <h2 className={settings.partnerLogo ? 'sr-only' : 'mt-2 text-5xl font-extrabold'}>{settings.partnerName}</h2>
          {settings.partnerLogo ? (
            <img src={settings.partnerLogo} alt={`${settings.partnerName}: ${settings.partnerTagline}`} className="mx-auto mt-4 h-36 w-auto lg:mx-0" loading="lazy" width={420} height={250} />
          ) : (
            <p className="mt-2 font-display text-2xl font-bold">{settings.partnerTagline}</p>
          )}
          <p className="mt-4 text-lg leading-relaxed text-night-800/80">{settings.partnerBlurb}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            {settings.partnerCtaUrl && (
              <ExternalLink href={settings.partnerCtaUrl} className="btn bg-sathe-red text-white shadow-lg shadow-sathe-red/30 hover:-translate-y-0.5 hover:bg-[#c62828]">
                {settings.partnerCtaLabel}
              </ExternalLink>
            )}
            {settings.partnerPhone && (
              <a href={`tel:${settings.partnerPhone.replace(/[^\d+]/g, '')}`} className="btn border-2 border-night-900/15 hover:border-sathe-red hover:text-sathe-red">
                <Phone className="size-5" /> {settings.partnerPhone}
              </a>
            )}
            {settings.partnerEmail && (
              <a href={`mailto:${settings.partnerEmail}`} className="btn border-2 border-night-900/15 hover:border-sathe-red hover:text-sathe-red">
                <Mail className="size-5" /> Email us
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
