import type { CSSProperties } from 'react'

const MARIGOLD = ['#ff8a1f', '#ffcc29', '#ff6a00', '#ffb000']

function Flower({ x, y, r, color }: { x: number; y: number; r: number; color: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={color} />
      <circle cx={x} cy={y} r={r * 0.62} fill="none" stroke="#c2410c" strokeOpacity={0.35} strokeWidth={1.2} />
      <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.28} fill="#fff4c7" opacity={0.55} />
    </g>
  )
}

function Swag({ index }: { index: number }) {
  const w = 160
  const flowers = Array.from({ length: 13 }, (_, i) => {
    const t = i / 12
    const x = 2 * (1 - t) * t * 80 + t * t * w
    const y = (1 - t) * (1 - t) * 8 + 2 * (1 - t) * t * 74 + t * t * 8
    return <Flower key={i} x={x} y={y} r={7.5} color={MARIGOLD[(i + index) % MARIGOLD.length]} />
  })
  return (
    <svg width={w} height={118} viewBox={`0 0 ${w} 118`} className="shrink-0 overflow-visible" aria-hidden>
      <path d="M0 8 Q80 74 160 8" stroke="#7c2d12" strokeOpacity={0.5} strokeWidth={1.5} fill="none" />
      {flowers}
      {/* Tassel of three flowers and a mango leaf where two swags meet. */}
      <line x1={0} y1={8} x2={0} y2={78} stroke="#7c2d12" strokeOpacity={0.5} strokeWidth={1.5} />
      {[24, 40, 56].map((y, i) => (
        <Flower key={y} x={0} y={y} r={6.5} color={MARIGOLD[(i + index + 1) % MARIGOLD.length]} />
      ))}
      <path d="M0 64 C -9 76 -7 92 0 104 C 7 92 9 76 0 64 Z" fill="#1f9d55" />
      <path d="M0 66 L0 102" stroke="#14532d" strokeWidth={1} />
      <path d="M-12 2 C -4 -6 4 -6 12 2 C 4 10 -4 10 -12 2 Z" fill="#22a35a" />
    </svg>
  )
}

/** A marigold-and-mango-leaf toran strung across the top of the page. */
export function Toran({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none flex overflow-hidden pl-2 ${className}`} aria-hidden>
      {Array.from({ length: 16 }, (_, i) => (
        <Swag key={i} index={i} />
      ))}
    </div>
  )
}

export function Lantern({
  className = '',
  style,
  hue = 'rani',
  drop = 80,
}: {
  className?: string
  style?: CSSProperties
  hue?: 'rani' | 'peacock' | 'marigold'
  drop?: number
}) {
  const body = { rani: ['#ff4f9a', '#a3104f'], peacock: ['#3fe0d8', '#0b6f73'], marigold: ['#ffcc29', '#e86a00'] }[hue]
  const id = `lantern-${hue}`
  return (
    <svg
      className={`pointer-events-none origin-top animate-sway ${className}`}
      style={style}
      width={64}
      height={drop + 150}
      viewBox={`0 0 64 ${drop + 150}`}
      aria-hidden
    >
      <defs>
        <radialGradient id={`${id}-glow`} cx="50%" cy="55%" r="55%">
          <stop offset="0" stopColor="#fff4c7" />
          <stop offset="0.45" stopColor={body[0]} />
          <stop offset="1" stopColor={body[1]} />
        </radialGradient>
      </defs>
      <line x1={32} y1={0} x2={32} y2={drop} stroke="#ffcc29" strokeOpacity={0.6} strokeWidth={1.5} />
      <g transform={`translate(0 ${drop})`}>
        <circle cx={32} cy={70} r={46} fill={body[0]} opacity={0.18} />
        <rect x={22} y={0} width={20} height={10} rx={3} fill="#f2b84b" />
        <path d="M14 18 Q32 4 50 18 L56 64 Q32 92 8 64 Z" fill={`url(#${id}-glow)`} />
        <path d="M14 18 L8 64 M32 10 L32 86 M50 18 L56 64" stroke="#f2b84b" strokeOpacity={0.8} strokeWidth={1.5} fill="none" />
        <path d="M10 40 H54" stroke="#f2b84b" strokeOpacity={0.7} strokeWidth={1.2} />
        <rect x={16} y={84} width={32} height={8} rx={3} fill="#f2b84b" />
        {[20, 26, 32, 38, 44].map((x) => (
          <line key={x} x1={x} y1={92} x2={x} y2={124} stroke={body[0]} strokeWidth={2.4} strokeLinecap="round" />
        ))}
        <circle cx={32} cy={128} r={4} fill="#ffcc29" />
      </g>
    </svg>
  )
}

export function Diya({ className = '', size = 64 }: { className?: string; size?: number }) {
  return (
    <svg className={`pointer-events-none ${className}`} width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <radialGradient id="diya-flame" cx="50%" cy="70%" r="70%">
          <stop offset="0" stopColor="#fffbe6" />
          <stop offset="0.35" stopColor="#ffe27a" />
          <stop offset="0.75" stopColor="#ff8a1f" />
          <stop offset="1" stopColor="#e0237a" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="diya-bowl" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffb547" />
          <stop offset="1" stopColor="#b4530f" />
        </linearGradient>
        <radialGradient id="diya-halo">
          <stop offset="0" stopColor="#ffcc29" stopOpacity={0.45} />
          <stop offset="1" stopColor="#ffcc29" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={32} cy={26} r={24} fill="url(#diya-halo)" />
      <g className="origin-[32px_38px] animate-flicker">
        <path d="M32 8 C 40 20 40 30 32 38 C 24 30 24 20 32 8 Z" fill="url(#diya-flame)" />
        <path d="M32 20 C 35 26 35 31 32 35 C 29 31 29 26 32 20 Z" fill="#fffbe6" opacity={0.9} />
      </g>
      <path d="M6 40 H58 C 56 52 44 58 32 58 C 20 58 8 52 6 40 Z" fill="url(#diya-bowl)" />
      <path d="M6 40 H58" stroke="#ffe27a" strokeWidth={2} strokeLinecap="round" />
      {[16, 24, 32, 40, 48].map((x) => (
        <circle key={x} cx={x} cy={48} r={1.8} fill={x === 32 ? '#13a8ab' : '#e0237a'} />
      ))}
    </svg>
  )
}

export function Sparkle({ className = '', style, size = 18 }: { className?: string; style?: CSSProperties; size?: number }) {
  return (
    <svg className={`pointer-events-none animate-twinkle ${className}`} style={style} width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z" fill="currentColor" />
    </svg>
  )
}

export function Burst({ className = '', style, color = '#ff7fb4' }: { className?: string; style?: CSSProperties; color?: string }) {
  return (
    <svg className={`pointer-events-none ${className}`} style={style} width={140} height={140} viewBox="-70 -70 140 140" aria-hidden>
      <g className="burst" stroke={color} strokeLinecap="round">
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2
          return (
            <line
              key={i}
              x1={Math.cos(a) * 18}
              y1={Math.sin(a) * 18}
              x2={Math.cos(a) * (i % 2 ? 50 : 62)}
              y2={Math.sin(a) * (i % 2 ? 50 : 62)}
              strokeWidth={i % 2 ? 1.5 : 2.5}
            />
          )
        })}
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2 + 0.2
          return <circle key={i} cx={Math.cos(a) * 66} cy={Math.sin(a) * 66} r={2.5} fill={color} stroke="none" />
        })}
      </g>
    </svg>
  )
}

export function LotusDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden>
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-haldi-300/70 sm:w-28" />
      <span className="size-1.5 rounded-full bg-haldi-300" />
      <svg width={54} height={30} viewBox="0 0 54 30">
        <path d="M27 2 C33 10 33 20 27 28 C21 20 21 10 27 2 Z" fill="#13a8ab" />
        <path d="M27 28 C20 22 12 18 4 18 C8 26 18 29 27 28 Z" fill="#ff8a1f" />
        <path d="M27 28 C34 22 42 18 50 18 C46 26 36 29 27 28 Z" fill="#ff8a1f" />
        <path d="M27 28 C22 18 16 12 10 10 C10 20 18 27 27 28 Z" fill="#e0237a" />
        <path d="M27 28 C32 18 38 12 44 10 C44 20 36 27 27 28 Z" fill="#e0237a" />
      </svg>
      <span className="size-1.5 rounded-full bg-haldi-300" />
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-haldi-300/70 sm:w-28" />
    </div>
  )
}

const STALLS = [
  { x: 0, w: 190, h: 120, a: '#e0237a', b: '#fff8ec' },
  { x: 170, w: 150, h: 96, a: '#13a8ab', b: '#ffcc29' },
  { x: 300, w: 200, h: 132, a: '#ff8a1f', b: '#fff8ec' },
  { x: 480, w: 140, h: 90, a: '#6a43b5', b: '#ffcc29' },
  { x: 600, w: 200, h: 128, a: '#e0237a', b: '#ffcc29' },
  { x: 780, w: 150, h: 100, a: '#13a8ab', b: '#fff8ec' },
  { x: 910, w: 190, h: 124, a: '#ff8a1f', b: '#e0237a' },
  { x: 1080, w: 160, h: 98, a: '#e0237a', b: '#fff8ec' },
]

/** A row of striped mela stall canopies, like the bazaar lane at the foot of the poster. */
export function StallSkyline({ className = '' }: { className?: string }) {
  return (
    <svg className={`pointer-events-none block w-full ${className}`} viewBox="0 0 1240 170" preserveAspectRatio="xMidYMax slice" aria-hidden>
      <defs>
        <linearGradient id="stall-body" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#4c2a8c" />
          <stop offset="1" stopColor="#241052" />
        </linearGradient>
        <radialGradient id="stall-glow" cx="50%" cy="0%" r="90%">
          <stop offset="0" stopColor="#ffcc29" stopOpacity={0.55} />
          <stop offset="1" stopColor="#ffcc29" stopOpacity={0} />
        </radialGradient>
        {STALLS.map((s, i) => (
          <pattern key={i} id={`stripe-${i}`} width={28} height={10} patternUnits="userSpaceOnUse">
            <rect width={14} height={10} fill={s.a} />
            <rect x={14} width={14} height={10} fill={s.b} />
          </pattern>
        ))}
      </defs>
      {STALLS.map((s, i) => {
        const top = 170 - s.h
        const eave = top + s.h * 0.42
        const scallops = Math.round(s.w / 22)
        const sw = s.w / scallops
        return (
          <g key={i}>
            <rect x={s.x + 12} y={eave} width={s.w - 24} height={170 - eave} fill="url(#stall-body)" />
            <rect x={s.x + 12} y={eave} width={s.w - 24} height={170 - eave} fill="url(#stall-glow)" />
            {Array.from({ length: Math.floor((s.w - 30) / 16) }, (_, k) => (
              <circle key={k} cx={s.x + 22 + k * 16} cy={eave + 22} r={2.2} fill="#fff4c7" className="animate-twinkle" style={{ animationDelay: `${(k % 4) * 0.4}s`, transformBox: 'fill-box', transformOrigin: 'center' }} />
            ))}
            <path d={`M${s.x} ${eave} L${s.x + s.w / 2} ${top} L${s.x + s.w} ${eave} Z`} fill={`url(#stripe-${i})`} />
            <path
              d={`M${s.x} ${eave} ${`q${sw / 2} 16 ${sw} 0 `.repeat(scallops)}`}
              fill={s.a}
            />
            <line x1={s.x + s.w / 2} y1={top} x2={s.x + s.w / 2} y2={top - 22} stroke="#ffcc29" strokeWidth={2} />
            <path d={`M${s.x + s.w / 2} ${top - 22} l18 6 l-18 6 Z`} fill={i % 2 ? '#ffcc29' : '#13a8ab'} />
          </g>
        )
      })}
      <rect x={0} y={162} width={1240} height={8} fill="#241052" />
    </svg>
  )
}
