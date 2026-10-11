import { useEffect, useState } from 'react'
import type { Performance, Settings } from '../content/types'

export type EventPhase = 'before' | 'live' | 'after'

export function eventInstant(settings: Settings, hhmm: string) {
  return new Date(`${settings.eventDate}T${hhmm}:00${settings.utcOffset}`)
}

export function eventPhase(settings: Settings, now: Date): EventPhase {
  const start = eventInstant(settings, settings.startTime)
  const end = eventInstant(settings, settings.endTime)
  if (now >= end) return 'after'
  if (settings.eventDayMode === 'on') return 'live'
  if (settings.eventDayMode === 'off') return 'before'
  return now >= start ? 'live' : 'before'
}

/** "13:00" -> "1 PM", "13:30" -> "1:30 PM" */
export function formatTime(hhmm?: string) {
  if (!hhmm) return ''
  const [h, m] = hhmm.split(':').map(Number)
  const hour = h % 12 || 12
  return `${hour}${m ? `:${String(m).padStart(2, '0')}` : ''} ${h >= 12 ? 'PM' : 'AM'}`
}

export function formatDate(settings: Settings, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(new Date(`${settings.eventDate}T12:00:00Z`))
}

export function entrySlots(settings: Settings) {
  return settings.entrySlots
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /^\d{1,2}:\d{2}$/.test(s))
}

const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** Minutes past midnight in the event's own timezone, regardless of the visitor's clock zone. */
export function eventClockMinutes(settings: Settings, now: Date) {
  const [sign, hh, mm] = settings.utcOffset.match(/([+-])(\d{2}):(\d{2})/)!.slice(1)
  const offset = (sign === '-' ? -1 : 1) * (Number(hh) * 60 + Number(mm))
  const utc = now.getUTCHours() * 60 + now.getUTCMinutes()
  return (((utc + offset) % 1440) + 1440) % 1440
}

export function stageStatus(performances: Performance[], settings: Settings, now: Date) {
  const scheduled = performances.filter((p) => p.visible && p.start).sort((a, b) => a.start!.localeCompare(b.start!))
  const clock = eventClockMinutes(settings, now)
  let current: Performance | undefined
  let next: Performance | undefined
  scheduled.forEach((p, i) => {
    const start = minutes(p.start!)
    const end = p.end ? minutes(p.end) : scheduled[i + 1]?.start ? minutes(scheduled[i + 1].start!) : start + 20
    if (clock >= start && clock < end) current = p
    if (!next && start > clock) next = p
  })
  return { current, next }
}

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const id = window.setInterval(() => setNow(new Date()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}
