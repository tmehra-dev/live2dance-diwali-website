// Builds src/content/vendors.seed.json (the vendor list baked into the site) from the
// vendor registration sheet, using the same importer the admin uses.
// Usage: node scripts/build-seed.ts <registration.csv | sheet-export.md>
import { readFile, writeFile } from 'node:fs/promises'
import Papa from 'papaparse'
import { detectMapping, mapVendors, vendorFields, type Row } from '../src/lib/importers.ts'
import type { Vendor } from '../src/content/types.ts'

const source = process.argv[2]
if (!source) throw new Error('Pass the registration sheet export (CSV or Markdown table).')
const text = await readFile(source, 'utf8')

function rowsFromMarkdown(md: string): Row[] {
  const table = md
    .split(/\r?\n/)
    .filter((l) => l.startsWith('|'))
    .map((l) => l.slice(1, -1).split(/(?<!\\)\|/).map((c) => c.trim()))
  const headerIndex = table.findIndex((r) => r.some((c) => c.startsWith('Business/Vendor Name')))
  const header = table[headerIndex]
  return table.slice(headerIndex + 1).map((cells) => Object.fromEntries(header.map((h, i) => [h, cells[i] ?? ''])))
}

const rows = source.endsWith('.csv')
  ? Papa.parse<Row>(text, { header: true, skipEmptyLines: true }).data
  : rowsFromMarkdown(text)

const mapping = detectMapping(Object.keys(rows[0]), vendorFields)
const { items, warnings } = mapVendors(rows, mapping)

// Editorial polish on top of what vendors typed into the form. Vendors with a logo in the
// Drive logo folder are treated as confirmed alongside those marked Paid.
const overrides: Record<string, Partial<Vendor>> = {
  'the-urban-twine': { description: 'Contemporary Indo-Western fashion for women: chic co-ord sets, elegant suits and timeless dresses.' },
  'ag-creations-llc': { name: 'AG Creations', description: 'Handmade couture jewelry, crafted piece by piece.' },
  'the-dessert-saga': { name: 'The Dessert Saga', description: 'Fusion Indian cakes by Parita: festive flavours, beautifully baked.', logo: 'media/vendors/the-dessert-saga.webp', visible: true, featured: true },
  'finomenon-investments': { description: 'Washington-based investment advisory and financial planning with a family-office approach to personal wealth.' },
  'smriti-designs-gift-shop': { name: 'Smriti Designs', description: 'Desi gifts and festive keepsakes.' },
  'mint-and-martini': { description: 'Indo-Chinese favourites from the Seattle Indian restaurant.', logo: 'media/vendors/mint-and-martini.webp', visible: true },
  'vale-matcha': { description: 'Specialty iced matcha lattes, made with JAS-certified matcha from Shizuoka, Japan.', visible: true },
  'henna-by-jasmin': { name: 'Henna by Jasmin', description: 'Festive henna designs by a professional mehndi artist.' },
  'bhojwani-foods': { name: "Bhojwani's", description: 'Premium packed sweets and savouries from a family business in India. Relish the purity of Bharat.', logo: 'media/vendors/bhojwani-foods.webp', visible: true },
  ishhaara: { description: 'Statement Indian jewelry for the festive season.', website: 'https://www.ishhaara.com', logo: 'media/vendors/ishhaara.webp', visible: true },
  'the-rara': { description: 'Handcrafted Indian artisan jewelry, from adorned bangles to intricate rings, with a modern twist.', website: 'https://www.facebook.com/share/1ArcTH9ZoT/' },
  murgabi: { description: 'Jackets, bags and upcycled products. Crafting elegance, transcending borders.', logo: 'media/vendors/murgabi.webp', visible: true },
  'fuchsia-shoes': { description: 'Handcrafted South Asian juttis that pair traditional embroidery with all-day comfort, with special Diwali pricing on select styles.' },
  'dhaga-by-shubh': { description: 'Hand-curated handloom silk sarees from different states of India. Connecting you to your roots.', logo: 'media/vendors/dhaga-by-shubh.webp', visible: true, featured: true },
  'kathmandu-momocha': { description: 'Himalayan momos in chicken (halal), pork, vegan, beef and cheese-ball varieties, plus pakoras and Himalayan fries.', logo: 'media/vendors/kathmandu-momocha.webp', visible: true, featured: true },
  ojasvit: { name: 'Jalebi Baby', description: 'Hot, fresh jalebi, paani poori and bread pakoda.', logo: 'media/vendors/jalebi-baby.webp', visible: true, featured: true },
  'samburna-indian-restaurant': { name: 'Samburna Indian Restaurant', description: 'Dosa and South Indian favourites.' },
  rove: { category: 'fashion', description: 'Handloom sarees and blouses.' },
  menoncollective: { name: 'Menon Collective', description: 'Bandhani dupattas and men’s kurtas.' },
  'ela-chi': { description: 'Speciality chai, plus pastries and finger food.', logo: 'media/vendors/ela-chi.webp', visible: true },
  'veena-world-shruti-sathe-journeyvibe-travel': { name: 'Veena World × JourneyVibe Travel', description: 'Travel, explore, celebrate life: group tours and holiday planning.', logo: 'media/vendors/veena-world.webp', visible: true },
}

const extra: Vendor[] = [
  { id: 'saris-r-us', name: "Saris R'Us", category: 'fashion', description: 'Sustainable clothing: saris, linens, cottons and more.', logo: 'media/vendors/saris-r-us.webp', visible: true },
]

const vendors: Vendor[] = [
  ...items.map((v) => ({ ...v, visible: false, featured: false, ...overrides[v.id] })),
  ...extra,
]

const unknown = Object.keys(overrides).filter((id) => !items.some((v) => v.id === id))
if (unknown.length) console.warn('Overrides with no matching vendor:', unknown)
warnings.forEach((w) => console.warn(w))

await writeFile('src/content/vendors.seed.json', JSON.stringify(vendors, null, 2) + '\n')
console.log(`Mapped columns:`, mapping)
console.log(`${vendors.length} vendors, ${vendors.filter((v) => v.visible).length} visible`)
