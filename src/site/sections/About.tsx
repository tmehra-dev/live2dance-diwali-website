import type { Settings } from '../../content/types'
import { ExternalLink, InstagramIcon, SectionHeading } from '../components/ui'

export function About({ settings }: { settings: Settings }) {
  const cards = [
    { title: 'About Live2Dance', body: settings.aboutLive2Dance, href: settings.instagramLive2Dance, handle: '@live2danceseattle', glow: 'from-rani-500/30' },
    { title: 'About Live2Serve', body: settings.aboutLive2Serve, href: settings.instagramLive2Serve, handle: '@live2serveseattle', glow: 'from-peacock-500/30' },
  ]
  return (
    <section id="about" className="relative bg-night-800/60 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading kicker="About us" title="Celebration and service, hand in hand" />
        <div className="grid gap-6 md:grid-cols-2">
          {cards.map((c) => (
            <div key={c.title} className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${c.glow} to-transparent p-[1px]`}>
              <div className="h-full rounded-3xl bg-night-900/90 p-7 sm:p-9">
                <h3 className="text-3xl font-extrabold">{c.title}</h3>
                <p className="mt-4 text-lg leading-relaxed text-ivory/75">{c.body}</p>
                {c.href && (
                  <ExternalLink href={c.href} className="mt-6 inline-flex items-center gap-2 font-semibold text-haldi-300 hover:underline">
                    <InstagramIcon className="size-5" /> {c.handle}
                  </ExternalLink>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
