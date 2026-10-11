// Quick assertions for the importer and schedule logic. Run with: npm run check
import assert from 'node:assert/strict'
import { normalizePerformanceType, normalizeVendorCategory, parseLinks, parseTime, diffImport } from '../src/lib/importers.ts'
import { eventPhase, stageStatus } from '../src/lib/time.ts'
import type { Performance, Settings } from '../src/content/types.ts'

const defaultSettings = { eventDate: '2026-10-24', startTime: '12:00', endTime: '18:00', utcOffset: '-07:00', eventDayMode: 'auto' } as Settings

assert.equal(parseTime('1:30 PM'), '13:30')
assert.equal(parseTime('1pm'), '13:00')
assert.equal(parseTime('1:00'), '13:00')
assert.equal(parseTime('12:15 PM'), '12:15')
assert.equal(parseTime('17:45'), '17:45')
assert.equal(parseTime('noon-ish'), '')

assert.deepEqual(parseLinks('Insta handle @theurbantwine'), { instagram: 'https://www.instagram.com/theurbantwine' })
assert.deepEqual(parseLinks('Samburna.com'), { website: 'https://samburna.com' })
assert.deepEqual(parseLinks('Jalebibabyseattle'), { instagram: 'https://www.instagram.com/jalebibabyseattle' })
assert.deepEqual(parseLinks('WIP'), {})

assert.equal(normalizeVendorCategory('Art/Craft/Apparel/Jewelry', 'Jackets, bags and upcycled products'), 'fashion')
assert.equal(normalizeVendorCategory('Art/Craft/Apparel/Jewelry', 'I make handmade jewelry'), 'jewelry')
assert.equal(normalizeVendorCategory('Packed Sweets, savory'), 'food')
assert.equal(normalizeVendorCategory('Henna Artists'), 'henna')
assert.equal(normalizeVendorCategory('Travel agency'), 'services')

assert.equal(normalizePerformanceType('Bollywood dance'), 'dance')
assert.equal(normalizePerformanceType('Stand-up comedy'), 'standup')
assert.equal(normalizePerformanceType('Live band'), 'band')
assert.equal(normalizePerformanceType('Vocals'), 'singing')

const s = defaultSettings
assert.equal(eventPhase(s, new Date('2026-10-24T11:59:00-07:00')), 'before')
assert.equal(eventPhase(s, new Date('2026-10-24T12:00:00-07:00')), 'live')
assert.equal(eventPhase(s, new Date('2026-10-24T18:00:00-07:00')), 'after')
assert.equal(eventPhase({ ...s, eventDayMode: 'on' }, new Date('2026-10-20T09:00:00-07:00')), 'live')

const lineup: Performance[] = [
  { id: 'a', title: 'A', type: 'dance', start: '12:15', end: '12:35', visible: true },
  { id: 'b', title: 'B', type: 'band', start: '13:00', visible: true },
  { id: 'c', title: 'C', type: 'standup', start: '13:30', visible: true },
]
// 12:20 PDT = 19:20 UTC: the clock is evaluated in event time, whatever the visitor's zone.
assert.equal(stageStatus(lineup, s, new Date('2026-10-24T19:20:00Z')).current?.id, 'a')
assert.equal(stageStatus(lineup, s, new Date('2026-10-24T19:20:00Z')).next?.id, 'b')
assert.equal(stageStatus(lineup, s, new Date('2026-10-24T20:10:00Z')).current?.id, 'b')
assert.equal(stageStatus(lineup, s, new Date('2026-10-24T19:45:00Z')).current, undefined)

const merged = diffImport(
  [{ id: 'x', name: 'Edited name', description: '', visible: true }],
  [{ id: 'x', name: 'Form name', description: 'From form', visible: false }, { id: 'y', name: 'New', description: '', visible: true }],
  'merge',
)
assert.equal(merged.result[0].name, 'Edited name')
assert.equal(merged.result[0].description, 'From form')
assert.equal(merged.result[0].visible, true)
assert.equal(merged.added.length, 1)

console.log('All logic checks passed')
