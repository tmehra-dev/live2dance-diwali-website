import type { ReactNode } from 'react'
import type { SectionId, SiteContent } from '../content/types'
import { eventPhase, useNow } from '../lib/time'
import { Nav } from './components/Nav'
import { StickyTicketBar } from './components/StickyTicketBar'
import { About } from './sections/About'
import { Activities } from './sections/Activities'
import { Footer } from './sections/Footer'
import { Give } from './sections/Give'
import { Hero } from './sections/Hero'
import { Partner } from './sections/Partner'
import { Tickets } from './sections/Tickets'
import { VendorSection } from './sections/Vendors'
import { Visit } from './sections/Visit'
import { Watch } from './sections/Watch'

export function Page({ content }: { content: SiteContent }) {
  const { settings, sections, vendors, performances, activities, faqs } = content
  const now = useNow(1000)
  // Before the clock is known (prerender and first paint) the event is always upcoming.
  const phase = now ? eventPhase(settings, now) : 'before'
  const visibleVendors = vendors.filter((v) => v.visible)

  const render: Record<SectionId, () => ReactNode> = {
    tickets: () => <Tickets settings={settings} phase={phase} />,
    watch: () => <Watch settings={settings} performances={performances} phase={phase} now={now} />,
    indulge: () => (
      <VendorSection
        id="indulge"
        kicker="Indulge"
        title="Eat your way through the Mela"
        intro="Momos, jalebis, chai, matcha, Indo-Chinese, festive cakes and mithai: come hungry."
        vendors={visibleVendors.filter((v) => v.category === 'food')}
        tone="raised"
      />
    ),
    shop: () => (
      <VendorSection
        id="shop"
        kicker="Shop"
        title="Stroll the Mela bazaar"
        intro="Handloom sarees, juttis, jewelry, gifts and more from local makers and boutiques."
        vendors={visibleVendors.filter((v) => v.category !== 'food')}
        withFilters
      />
    ),
    do: () => <Activities activities={activities} />,
    partner: () => <Partner settings={settings} />,
    give: () => <Give settings={settings} phase={phase} />,
    visit: () => <Visit settings={settings} faqs={faqs} />,
    about: () => <About settings={settings} />,
  }

  return (
    <>
      <a href="#main" className="sr-only z-50 rounded-full bg-haldi-500 px-4 py-2 text-night-900 focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>
      <Nav sections={sections} settings={settings} phase={phase} />
      <main id="main">
        <Hero settings={settings} performances={performances} phase={phase} now={now} />
        {sections
          .filter((s) => s.visible)
          .map((s) => (
            <div key={s.id}>{render[s.id]()}</div>
          ))}
      </main>
      <Footer settings={settings} sections={sections} />
      <StickyTicketBar settings={settings} phase={phase} />
    </>
  )
}
