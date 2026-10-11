import { useState, type ReactNode } from 'react'
import { Globe, Search } from 'lucide-react'
import type { Vendor, VendorCategory } from '../../content/types'
import { ExternalLink, InstagramIcon, SectionHeading } from '../components/ui'

export const CATEGORY_META: Record<VendorCategory, { label: string; canopy: string; tint: string }> = {
  food: { label: 'Food & Treats', canopy: '#e0237a', tint: 'text-rani-300' },
  fashion: { label: 'Sarees & Fashion', canopy: '#13a8ab', tint: 'text-peacock-300' },
  jewelry: { label: 'Jewelry & Crafts', canopy: '#ff8a1f', tint: 'text-marigold-400' },
  henna: { label: 'Henna & Beauty', canopy: '#6a43b5', tint: 'text-haldi-300' },
  services: { label: 'Services & More', canopy: '#ffcc29', tint: 'text-haldi-300' },
}

function Canopy({ color }: { color: string }) {
  return (
    <div aria-hidden className="relative h-9">
      <div className="absolute inset-0" style={{ background: `repeating-linear-gradient(90deg, ${color} 0 22px, #fff8ec 22px 44px)` }} />
      <div
        className="absolute inset-x-0 -bottom-3 h-3"
        style={{ background: `radial-gradient(circle at 11px 0, ${color} 10.5px, transparent 11px) 0 0 / 22px 12px repeat-x` }}
      />
    </div>
  )
}

function Monogram({ name, color }: { name: string; color: string }) {
  const letters = name
    .replace(/[^A-Za-z0-9 ]/g, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
  return (
    <div className="grid size-full place-items-center" style={{ background: `radial-gradient(circle at 30% 25%, #fff8ec, ${color})` }}>
      <span className="font-script text-5xl text-night-900/85">{letters}</span>
    </div>
  )
}

function VendorCard({ vendor }: { vendor: Vendor }) {
  const meta = CATEGORY_META[vendor.category]
  const [open, setOpen] = useState(false)
  return (
    <article className="group flex w-full flex-col overflow-hidden rounded-3xl bg-night-800 ring-1 ring-white/10 transition hover:-translate-y-1 hover:ring-haldi-300/50">
      <Canopy color={meta.canopy} />
      <div className="flex flex-1 flex-col p-5 pt-7">
        <div className="mx-auto aspect-square w-32 overflow-hidden rounded-2xl bg-white shadow-lg ring-4 ring-white/10 transition group-hover:scale-105">
          {vendor.logo ? (
            <img src={vendor.logo} alt={`${vendor.name} logo`} className="size-full object-cover" loading="lazy" width={128} height={128} />
          ) : (
            <Monogram name={vendor.name} color={meta.canopy} />
          )}
        </div>
        <p className={`mt-4 text-center text-xs font-bold tracking-[0.2em] uppercase ${meta.tint}`}>{meta.label}</p>
        <h3 className="mt-1 text-center font-display text-xl leading-tight font-bold">{vendor.name}</h3>
        {vendor.description && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className={`mt-2 text-center text-sm leading-relaxed text-ivory/70 ${open ? '' : 'line-clamp-3'}`}
            aria-expanded={open}
          >
            {vendor.description}
          </button>
        )}
        {(vendor.instagram || vendor.website) && (
          <div className="mt-auto flex justify-center gap-2 pt-4">
            {vendor.instagram && (
              <ExternalLink href={vendor.instagram} className="grid size-10 place-items-center rounded-full bg-white/5 text-ivory/80 hover:bg-rani-500 hover:text-white" aria-label={`${vendor.name} on Instagram`}>
                <InstagramIcon className="size-5" />
              </ExternalLink>
            )}
            {vendor.website && (
              <ExternalLink href={vendor.website} className="grid size-10 place-items-center rounded-full bg-white/5 text-ivory/80 hover:bg-peacock-500 hover:text-white" aria-label={`${vendor.name} website`}>
                <Globe className="size-5" />
              </ExternalLink>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

function sortVendors(vendors: Vendor[]) {
  return [...vendors].sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || Number(!!b.logo) - Number(!!a.logo) || a.name.localeCompare(b.name))
}

export function VendorSection({
  id,
  kicker,
  title,
  intro,
  vendors,
  withFilters = false,
  tone = 'plain',
  footer,
}: {
  id: string
  kicker: string
  title: string
  intro: string
  vendors: Vendor[]
  withFilters?: boolean
  tone?: 'plain' | 'raised'
  footer?: ReactNode
}) {
  const [category, setCategory] = useState<VendorCategory | 'all'>('all')
  const [query, setQuery] = useState('')
  const categories = [...new Set(vendors.map((v) => v.category))]
  const q = query.trim().toLowerCase()
  const shown = sortVendors(
    vendors.filter((v) => (category === 'all' || v.category === category) && (!q || `${v.name} ${v.description}`.toLowerCase().includes(q))),
  )

  return (
    <section id={id} className={`relative py-20 sm:py-28 ${tone === 'raised' ? 'bg-night-800/60' : ''}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading kicker={kicker} title={title}>
          {intro}
        </SectionHeading>

        {vendors.length === 0 ? (
          <p className="text-center text-ivory/70">Our vendor line-up is being finalised. Check back soon!</p>
        ) : (
          <>
            {withFilters && (
              <div className="mb-10 flex flex-col items-center gap-4">
                {categories.length > 1 && (
                  <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label="Filter by category">
                    {(['all', ...categories] as const).map((c) => (
                      <button
                        key={c}
                        role="tab"
                        aria-selected={category === c}
                        onClick={() => setCategory(c)}
                        className={`rounded-full px-4 py-2 font-display font-semibold transition ${category === c ? 'bg-haldi-500 text-night-900' : 'bg-white/5 text-ivory/80 hover:bg-white/10'}`}
                      >
                        {c === 'all' ? 'Everything' : CATEGORY_META[c].label}
                      </button>
                    ))}
                  </div>
                )}
                {vendors.length > 8 && (
                  <label className="relative w-full max-w-sm">
                    <span className="sr-only">Search vendors</span>
                    <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ivory/50" />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search sarees, jewelry, juttis…"
                      className="w-full rounded-full border border-white/15 bg-white/5 py-3 pr-4 pl-12 text-ivory placeholder:text-ivory/40 focus:border-haldi-300 focus:outline-none"
                    />
                  </label>
                )}
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-5">
              {shown.map((v) => (
                <div key={v.id} className="flex w-[calc(50%-0.375rem)] sm:w-[calc(50%-0.625rem)] md:w-[calc(33.333%-0.834rem)] lg:w-[calc(25%-0.9375rem)]">
                  <VendorCard vendor={v} />
                </div>
              ))}
            </div>
            {shown.length === 0 && <p className="mt-6 text-center text-ivory/60">No stalls match that search.</p>}
          </>
        )}
        {footer}
      </div>
    </section>
  )
}
