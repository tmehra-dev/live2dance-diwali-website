export type VendorCategory = 'food' | 'fashion' | 'jewelry' | 'henna' | 'services'

export interface Vendor {
  /** Stable key: slug of the name the vendor registered with. Re-imports match on this. */
  id: string
  name: string
  category: VendorCategory
  description: string
  website?: string
  instagram?: string
  logo?: string
  featured?: boolean
  visible: boolean
}

export type PerformanceType = 'dance' | 'singing' | 'band' | 'standup' | 'dj' | 'other'

export interface Performance {
  id: string
  title: string
  performer?: string
  type: PerformanceType
  /** 24h "HH:MM" in event local time. */
  start?: string
  end?: string
  stage?: string
  description?: string
  image?: string
  link?: string
  visible: boolean
}

export interface Activity {
  id: string
  title: string
  description: string
  icon: string
  visible: boolean
}

export interface Faq {
  id: string
  question: string
  answer: string
  visible: boolean
}

export type SectionId = 'tickets' | 'watch' | 'indulge' | 'shop' | 'do' | 'partner' | 'give' | 'visit' | 'about'

export interface Section {
  id: SectionId
  label: string
  visible: boolean
}

export type EventDayMode = 'auto' | 'on' | 'off'

export interface Settings {
  eventName: string
  eventTagline: string
  presenter: string
  heroIntro: string
  eventDate: string
  startTime: string
  endTime: string
  utcOffset: string
  venueName: string
  venueAddress: string
  mapUrl: string

  ticketUrl: string
  ticketsOpen: boolean
  soldOut: boolean
  ticketMinimum: string
  kidsFreeUnder: string
  entrySlots: string
  charityNotice: string

  announcement: string
  announcementLink: string

  lineupTeaser: string
  eventDayMode: EventDayMode
  nowOnStage: string

  causeHeadline: string
  causeText: string
  donateUrl: string
  volunteerUrl: string
  vendorInterestUrl: string

  aboutLive2Dance: string
  aboutLive2Serve: string
  instagramLive2Dance: string
  instagramLive2Serve: string
  contactEmail: string

  partnerName: string
  partnerTitle: string
  partnerTagline: string
  partnerBlurb: string
  partnerLogo: string
  partnerPhoto: string
  partnerCtaLabel: string
  partnerCtaUrl: string
  partnerPhone: string
  partnerEmail: string
}

export interface SiteContent {
  settings: Settings
  sections: Section[]
  vendors: Vendor[]
  performances: Performance[]
  activities: Activity[]
  faqs: Faq[]
  updatedAt?: string
}
