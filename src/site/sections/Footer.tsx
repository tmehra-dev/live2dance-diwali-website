import { useRef } from 'react'
import { Mail } from 'lucide-react'
import type { Section, Settings } from '../../content/types'
import { Diya, Toran } from '../components/Decor'
import { ExternalLink, InstagramIcon } from '../components/ui'

const SECRET_TAPS = 5

export function Footer({ settings, sections }: { settings: Settings; sections: Section[] }) {
  const taps = useRef<number[]>([])

  // Five quick taps on the footer diya opens the admin page.
  const onDiyaTap = () => {
    const now = Date.now()
    taps.current = [...taps.current.filter((t) => now - t < 2500), now]
    if (taps.current.length >= SECRET_TAPS) window.location.href = 'admin.html'
  }

  return (
    <footer className="relative overflow-hidden bg-night-950 pt-24 pb-28 sm:pb-12">
      <Toran className="absolute inset-x-0 top-0 opacity-80" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <img src="media/logo-diwali-480.png" alt={settings.eventName} className="h-28 w-auto" width={480} height={320} loading="lazy" />
            <p className="mt-4 max-w-sm text-ivory/70">
              One Celebration. One Community. One Cause. Presented by {settings.presenter}, a 501(c)(3) nonprofit.
            </p>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-haldi-300">Explore</h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-ivory/75">
              {sections
                .filter((s) => s.visible)
                .map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="hover:text-haldi-300">
                      {s.label}
                    </a>
                  </li>
                ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-haldi-300">Stay in touch</h2>
            <ul className="mt-3 space-y-2 text-ivory/75">
              {settings.instagramLive2Dance && (
                <li>
                  <ExternalLink href={settings.instagramLive2Dance} className="inline-flex items-center gap-2 hover:text-haldi-300">
                    <InstagramIcon className="size-4" /> @live2danceseattle
                  </ExternalLink>
                </li>
              )}
              {settings.instagramLive2Serve && (
                <li>
                  <ExternalLink href={settings.instagramLive2Serve} className="inline-flex items-center gap-2 hover:text-haldi-300">
                    <InstagramIcon className="size-4" /> @live2serveseattle
                  </ExternalLink>
                </li>
              )}
              {settings.contactEmail && (
                <li>
                  <a href={`mailto:${settings.contactEmail}`} className="inline-flex items-center gap-2 hover:text-haldi-300">
                    <Mail className="size-4" /> {settings.contactEmail}
                  </a>
                </li>
              )}
              {settings.vendorInterestUrl && (
                <li>
                  <ExternalLink href={settings.vendorInterestUrl} className="hover:text-haldi-300">
                    Interested in a stall next year?
                  </ExternalLink>
                </li>
              )}
            </ul>
          </div>
        </div>

        <p className="mt-12 text-xs leading-relaxed text-ivory/45">{settings.charityNotice}</p>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-ivory/50 sm:flex-row">
          <p>© {settings.eventDate.slice(0, 4)} Live2Dance & Live2Serve Foundation. Made with light in Seattle.</p>
          <button type="button" onClick={onDiyaTap} className="cursor-default rounded-full p-1" aria-label="Happy Diwali">
            <Diya size={36} />
          </button>
        </div>
      </div>
    </footer>
  )
}
