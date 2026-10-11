import type { Activity, Faq, Section, Settings, SiteContent, Vendor } from './types'
import seedVendors from './vendors.seed.json'

export const defaultSettings: Settings = {
  eventName: 'Live2Dance Waali Diwali',
  eventTagline: "Seattle's Biggest Diwali Mela",
  presenter: 'Live2Serve Foundation',
  heroIntro:
    'An afternoon packed with music, dance, food, games, colors, culture, laughter and all the Diwali feels. Bring your family. Bring your friends. Bring your light.',
  eventDate: '2026-10-24',
  startTime: '12:00',
  endTime: '18:00',
  utcOffset: '-07:00',
  venueName: '415 Westlake',
  venueAddress: '415 Westlake Ave N, Seattle, WA 98109',
  mapUrl: 'https://maps.app.goo.gl/HKLFq5KWvRVDp7eL7',

  ticketUrl: 'https://events.ticketleap.com/tickets/live2serve/l2dwalidiwali',
  ticketsOpen: true,
  soldOut: false,
  ticketMinimum: '5',
  kidsFreeUnder: '6',
  entrySlots: '12:00,13:00,14:00,15:00,16:00,17:00',
  charityNotice:
    'Live2Serve Foundation is a 501(c)(3) nonprofit organization. To the extent that a ticket payment includes the value of admission, goods, services, or other benefits received in connection with the event, the amount eligible for a charitable contribution deduction may be limited to the portion of the payment exceeding the fair-market value of those benefits. Please consult your tax advisor regarding your individual circumstances.',

  announcement: '',
  announcementLink: '',

  lineupTeaser:
    "Dancers, singers, bands and a few laughs: our stage lineup is being finalised. Check back soon, or follow us on Instagram for the reveal.",
  eventDayMode: 'auto',
  nowOnStage: '',

  causeHeadline: 'Even a small light can make a difference',
  causeText:
    'That idea is at the heart of Live2Serve. This Mela is our opportunity to celebrate our culture while bringing the community together for something bigger: creating joy, strengthening connections, supporting service, and helping leave our world a little better than we found it.',
  donateUrl: 'https://www.paypal.com/donate/?hosted_button_id=LJ96ANA3QS25Y',
  volunteerUrl: '',
  vendorInterestUrl: '',

  aboutLive2Dance:
    "Live2Dance is a movement, a family, and a home away from home for thousands of Indians in Seattle. What started as a space for Bollywood dance has blossomed into the city's most vibrant Indian cultural hub, with over 3,000 active members celebrating Indian arts, traditions and voices.",
  aboutLive2Serve:
    'Live2Serve Foundation is the philanthropic arm of Live2Dance, a 501(c)(3) nonprofit born from the belief that celebration and service go hand in hand. Through partnerships, volunteer programs and fundraising events, Live2Serve turns the joy of cultural celebration into lasting community support.',
  instagramLive2Dance: 'https://www.instagram.com/live2danceseattle',
  instagramLive2Serve: 'https://www.instagram.com/live2serveseattle',
  contactEmail: '',

  partnerName: 'Team Sathe',
  partnerTitle: 'Exclusive Real Estate Partner',
  partnerTagline: 'Buying and selling homes with heart',
  partnerBlurb:
    "Whether you're buying your first home, upsizing for a growing family, or selling to start your next chapter, Team Sathe brings local expertise and genuine care to every move. Proud to light up this Diwali with our community.",
  partnerLogo: 'media/team-sathe-logo.webp',
  partnerPhoto: 'media/team-sathe-photo.webp',
  partnerCtaLabel: 'Connect with Team Sathe',
  partnerCtaUrl: '',
  partnerPhone: '',
  partnerEmail: '',
}

export const defaultSections: Section[] = [
  { id: 'tickets', label: 'Tickets', visible: true },
  { id: 'watch', label: 'Watch', visible: true },
  { id: 'indulge', label: 'Indulge', visible: true },
  { id: 'shop', label: 'Shop', visible: true },
  { id: 'do', label: 'Do', visible: true },
  { id: 'partner', label: 'Team Sathe', visible: true },
  { id: 'give', label: 'Give', visible: true },
  { id: 'visit', label: 'Visit', visible: true },
  { id: 'about', label: 'About', visible: true },
]

export const defaultActivities: Activity[] = [
  { id: 'mela-games', title: 'Mela Games', description: 'Ring toss, stall games and little prizes, the classic Mela fun for every age.', icon: 'target', visible: true },
  { id: 'kids-corner', title: 'Kids Corner', description: 'A colourful space for the little ones to play, create and celebrate.', icon: 'baby', visible: true },
  { id: 'henna', title: 'Henna Art', description: 'Get your festive mehndi done by talented henna artists.', icon: 'hand', visible: true },
  { id: 'photo-spots', title: 'Festive Photo Spots', description: 'Diyas, marigolds and lights: bring your best Diwali outfit and strike a pose.', icon: 'camera', visible: true },
]

export const defaultFaqs: Faq[] = [
  { id: 'price', question: 'How much are tickets?', answer: 'Entry starts at a $5 minimum contribution per person, and you can choose to give more. Whether it is $5, $25, $100 or more, every contribution supports Live2Serve’s nonprofit work.', visible: true },
  { id: 'kids', question: 'Do kids need a ticket?', answer: 'Children under 6 get in free.', visible: true },
  { id: 'slots', question: 'What do the entry times on the tickets mean?', answer: 'Pick the entry-time ticket that best matches when you plan to arrive. You can enter at or after the time on your ticket, and once you’re in you are welcome to stay until the Mela wraps up at 6:00 PM.', visible: true },
  { id: 'getting-there', question: 'How do I get there?', answer: 'The Mela is at 415 Westlake Ave N in South Lake Union, Seattle. The South Lake Union Streetcar runs along Westlake Ave N, and paid street and garage parking is available nearby.', visible: true },
  { id: 'tax', question: 'Is my ticket tax-deductible?', answer: 'Live2Serve Foundation is a 501(c)(3) nonprofit. The deductible amount may be limited to the portion of your payment above the fair-market value of admission and benefits. Please consult your tax advisor.', visible: true },
  { id: 'changes', question: 'Could the schedule change?', answer: 'Event activities, programming, schedules, participating vendors and performers may be modified as circumstances require. This page is always kept up to date.', visible: true },
]

export const bakedContent: SiteContent = {
  settings: defaultSettings,
  sections: defaultSections,
  vendors: seedVendors as Vendor[],
  performances: [],
  activities: defaultActivities,
  faqs: defaultFaqs,
}
