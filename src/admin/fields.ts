import type { Settings } from '../content/types'

export type FieldType = 'text' | 'textarea' | 'url' | 'bool' | 'select' | 'date' | 'time' | 'image' | 'email'

export interface Field {
  key: string
  label: string
  type: FieldType
  help?: string
  options?: { value: string; label: string }[]
  placeholder?: string
}

export interface SettingsGroup {
  id: string
  title: string
  description: string
  fields: (Field & { key: keyof Settings })[]
}

export const settingsGroups: SettingsGroup[] = [
  {
    id: 'live',
    title: 'Live controls',
    description: 'Quick switches you might flip in the days before (or during) the Mela.',
    fields: [
      { key: 'announcement', label: 'Announcement bar', type: 'text', help: 'Shown in a bright strip at the very top of every page. Leave empty to hide it.', placeholder: 'e.g. Only 50 tickets left for the 12 PM slot!' },
      { key: 'announcementLink', label: 'Announcement link', type: 'url', help: 'Optional: where the announcement takes people when tapped.' },
      { key: 'ticketsOpen', label: 'Ticket sales open', type: 'bool', help: 'Turn off to replace every ticket button with "Tickets closed".' },
      { key: 'soldOut', label: 'Sold out', type: 'bool', help: 'Shows "Sold out" on every ticket button.' },
      {
        key: 'eventDayMode',
        label: 'Event-day mode',
        type: 'select',
        help: 'Automatic switches the homepage to "The Mela is on now!" from start to end time. "Force on" lets you preview it.',
        options: [
          { value: 'auto', label: 'Automatic (recommended)' },
          { value: 'on', label: 'Force on' },
          { value: 'off', label: 'Off' },
        ],
      },
      { key: 'nowOnStage', label: '"On stage now" override', type: 'text', help: 'During the event, type what is on stage right now to override the schedule. Leave empty to follow the schedule.' },
    ],
  },
  {
    id: 'event',
    title: 'Event details',
    description: 'Date, time and place. These appear in the hero, tickets, visit section and countdown.',
    fields: [
      { key: 'eventName', label: 'Event name', type: 'text' },
      { key: 'eventTagline', label: 'Tagline', type: 'text' },
      { key: 'presenter', label: 'Presented by', type: 'text' },
      { key: 'eventDate', label: 'Date', type: 'date' },
      { key: 'startTime', label: 'Start time', type: 'time' },
      { key: 'endTime', label: 'End time', type: 'time' },
      { key: 'utcOffset', label: 'Time zone offset', type: 'text', help: 'Seattle in October is -07:00 (PDT).' },
      { key: 'venueName', label: 'Venue name', type: 'text' },
      { key: 'venueAddress', label: 'Venue address', type: 'text', help: 'Also used for the map.' },
      { key: 'mapUrl', label: 'Directions link', type: 'url' },
    ],
  },
  {
    id: 'tickets',
    title: 'Tickets',
    description: 'Everything shown in the "Your ticket is your support" section.',
    fields: [
      { key: 'ticketUrl', label: 'Ticket link (TicketLeap)', type: 'url', help: 'Every "Get Tickets" button goes here.' },
      { key: 'ticketMinimum', label: 'Minimum contribution ($)', type: 'text' },
      { key: 'kidsFreeUnder', label: 'Kids free under age', type: 'text' },
      { key: 'entrySlots', label: 'Entry time slots', type: 'text', help: 'Comma-separated 24-hour times, matching the TicketLeap ticket types. e.g. 12:00,13:00,14:00' },
      { key: 'charityNotice', label: 'Charitable contribution notice', type: 'textarea' },
    ],
  },
  {
    id: 'story',
    title: 'Homepage text',
    description: 'The words people read as they scroll.',
    fields: [
      { key: 'heroIntro', label: 'Hero introduction', type: 'textarea' },
      { key: 'lineupTeaser', label: 'Lineup "coming soon" message', type: 'textarea', help: 'Shown in the Watch section until performances are added.' },
      { key: 'causeHeadline', label: 'Give: headline', type: 'text' },
      { key: 'causeText', label: 'Give: story', type: 'textarea' },
      { key: 'aboutLive2Dance', label: 'About Live2Dance', type: 'textarea' },
      { key: 'aboutLive2Serve', label: 'About Live2Serve', type: 'textarea' },
    ],
  },
  {
    id: 'links',
    title: 'Links & contact',
    description: 'Buttons only appear when a link is filled in.',
    fields: [
      { key: 'donateUrl', label: 'Donate link', type: 'url' },
      { key: 'volunteerUrl', label: 'Volunteer sign-up link', type: 'url' },
      { key: 'vendorInterestUrl', label: 'Future vendor interest link', type: 'url' },
      { key: 'instagramLive2Dance', label: 'Live2Dance Instagram', type: 'url' },
      { key: 'instagramLive2Serve', label: 'Live2Serve Instagram', type: 'url' },
      { key: 'contactEmail', label: 'Contact email', type: 'email' },
    ],
  },
  {
    id: 'partner',
    title: 'Team Sathe (exclusive partner)',
    description: 'The ivory partner section and the badge under the hero.',
    fields: [
      { key: 'partnerName', label: 'Partner name', type: 'text' },
      { key: 'partnerTitle', label: 'Title', type: 'text' },
      { key: 'partnerTagline', label: 'Tagline', type: 'text', help: 'Shown as text only when there is no logo (the logo already includes the motto).' },
      { key: 'partnerBlurb', label: 'Blurb', type: 'textarea' },
      { key: 'partnerLogo', label: 'Logo', type: 'image' },
      { key: 'partnerPhoto', label: 'Photo', type: 'image' },
      { key: 'partnerCtaLabel', label: 'Button label', type: 'text' },
      { key: 'partnerCtaUrl', label: 'Button link', type: 'url', help: 'The button only shows when this is filled in.' },
      { key: 'partnerPhone', label: 'Phone', type: 'text' },
      { key: 'partnerEmail', label: 'Email', type: 'email' },
    ],
  },
]

export const vendorEditFields: Field[] = [
  { key: 'name', label: 'Name', type: 'text' },
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { value: 'food', label: 'Food & Treats (Indulge section)' },
      { value: 'fashion', label: 'Sarees & Fashion' },
      { value: 'jewelry', label: 'Jewelry & Crafts' },
      { value: 'henna', label: 'Henna & Beauty' },
      { value: 'services', label: 'Services & More' },
    ],
  },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'instagram', label: 'Instagram link', type: 'url' },
  { key: 'website', label: 'Website', type: 'url' },
  { key: 'logo', label: 'Logo', type: 'image' },
  { key: 'featured', label: 'Featured (shown first)', type: 'bool' },
  { key: 'visible', label: 'Show on website', type: 'bool' },
]

export const performanceEditFields: Field[] = [
  { key: 'title', label: 'Act title', type: 'text' },
  { key: 'performer', label: 'Performer / group', type: 'text' },
  {
    key: 'type',
    label: 'Type',
    type: 'select',
    options: [
      { value: 'dance', label: 'Dance' },
      { value: 'singing', label: 'Singing' },
      { value: 'band', label: 'Live band' },
      { value: 'standup', label: 'Stand-up comedy' },
      { value: 'dj', label: 'DJ' },
      { value: 'other', label: 'Other / special act' },
    ],
  },
  { key: 'start', label: 'Start time', type: 'time' },
  { key: 'end', label: 'End time', type: 'time' },
  { key: 'stage', label: 'Stage', type: 'text', placeholder: 'Main stage' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'image', label: 'Photo', type: 'image' },
  { key: 'link', label: 'Instagram / website', type: 'url' },
  { key: 'visible', label: 'Show on website', type: 'bool' },
]

export const activityEditFields: Field[] = [
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'description', label: 'Description', type: 'textarea' },
  {
    key: 'icon',
    label: 'Icon',
    type: 'select',
    options: ['target', 'baby', 'hand', 'camera', 'music', 'sparkles', 'palette', 'gift', 'star', 'ferris', 'food', 'heart', 'party'].map((v) => ({ value: v, label: v })),
  },
  { key: 'visible', label: 'Show on website', type: 'bool' },
]

export const faqEditFields: Field[] = [
  { key: 'question', label: 'Question', type: 'text' },
  { key: 'answer', label: 'Answer', type: 'textarea' },
  { key: 'visible', label: 'Show on website', type: 'bool' },
]

export const CSV_TEMPLATES = {
  vendors: 'name,category,description,links,logo,visible,featured\nKathmandu MomoCha,Food Vendors,"Himalayan momos, pakoras and fries",@momochakathmandu,,yes,no\n',
  performances:
    'title,performer,type,start,end,stage,description,image,link,visible\nOpening Bollywood medley,Live2Dance Crew,Dance,12:15 PM,12:30 PM,Main stage,High-energy opener,,https://www.instagram.com/live2danceseattle,yes\nAcoustic set,The Chai Notes,Band,1:00 PM,1:30 PM,Main stage,,,,yes\n',
}
