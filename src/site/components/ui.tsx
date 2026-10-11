import type { AnchorHTMLAttributes, ReactNode, SVGProps } from 'react'
import {
  Baby,
  Camera,
  Disc3,
  FerrisWheel,
  Footprints,
  Gift,
  Guitar,
  Hand,
  Heart,
  Laugh,
  MicVocal,
  Music,
  Palette,
  PartyPopper,
  Sparkles,
  Star,
  Target,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import type { PerformanceType } from '../../content/types'
import { LotusDivider } from './Decor'

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x={2} y={2} width={20} height={20} rx={5} />
      <circle cx={12} cy={12} r={4} />
      <circle cx={17.5} cy={6.5} r={0.6} fill="currentColor" />
    </svg>
  )
}

export function ExternalLink({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  )
}

export function SectionHeading({
  kicker,
  title,
  children,
  align = 'center',
  tone = 'dark',
}: {
  kicker: string
  title: ReactNode
  children?: ReactNode
  align?: 'center' | 'left'
  tone?: 'dark' | 'light'
}) {
  const center = align === 'center'
  return (
    <div className={`mb-10 sm:mb-14 ${center ? 'mx-auto max-w-2xl text-center' : 'max-w-xl'}`}>
      <p className={`kicker ${tone === 'light' ? 'text-rani-600' : ''}`}>{kicker}</p>
      <h2
        className={`mt-1 text-4xl leading-[1.05] font-extrabold sm:text-5xl ${tone === 'light' ? 'text-night-900' : 'text-ivory'}`}
      >
        {title}
      </h2>
      {center && <LotusDivider className="mt-4" />}
      {children && (
        <div className={`mt-4 text-lg leading-relaxed ${tone === 'light' ? 'text-night-800/80' : 'text-ivory/75'}`}>{children}</div>
      )}
    </div>
  )
}

const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  target: Target,
  baby: Baby,
  hand: Hand,
  camera: Camera,
  music: Music,
  sparkles: Sparkles,
  palette: Palette,
  gift: Gift,
  star: Star,
  ferris: FerrisWheel,
  food: UtensilsCrossed,
  heart: Heart,
  party: PartyPopper,
}

export function activityIcon(name: string): LucideIcon {
  return ACTIVITY_ICONS[name.toLowerCase()] ?? Sparkles
}

export const PERFORMANCE_TYPES: Record<PerformanceType, { label: string; icon: LucideIcon; accent: string; chip: string }> = {
  dance: { label: 'Dance', icon: Footprints, accent: 'from-rani-500 to-rani-700', chip: 'bg-rani-500/15 text-rani-300 ring-rani-500/40' },
  singing: { label: 'Singing', icon: MicVocal, accent: 'from-haldi-500 to-marigold-600', chip: 'bg-haldi-500/15 text-haldi-300 ring-haldi-500/40' },
  band: { label: 'Live Band', icon: Guitar, accent: 'from-peacock-500 to-peacock-700', chip: 'bg-peacock-500/15 text-peacock-300 ring-peacock-500/40' },
  standup: { label: 'Stand-up', icon: Laugh, accent: 'from-marigold-400 to-marigold-600', chip: 'bg-marigold-500/15 text-marigold-400 ring-marigold-500/40' },
  dj: { label: 'DJ', icon: Disc3, accent: 'from-night-500 to-night-700', chip: 'bg-night-500/25 text-ivory ring-night-500/50' },
  other: { label: 'Special Act', icon: Star, accent: 'from-ivory/80 to-haldi-300', chip: 'bg-ivory/10 text-ivory ring-ivory/30' },
}
