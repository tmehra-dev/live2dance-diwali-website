import type { Activity } from '../../content/types'
import { SectionHeading, activityIcon } from '../components/ui'

const GLOWS = ['from-rani-500 to-marigold-500', 'from-peacock-500 to-haldi-500', 'from-marigold-500 to-haldi-300', 'from-night-500 to-rani-500']

export function Activities({ activities }: { activities: Activity[] }) {
  const shown = activities.filter((a) => a.visible)
  if (!shown.length) return null
  return (
    <section id="do" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading kicker="Do" title="Play, create, celebrate">
          Games, colours and festive fun for every age, from the littlest ones to the grandparents.
        </SectionHeading>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map((a, i) => {
            const Icon = activityIcon(a.icon)
            return (
              <div key={a.id} className="card-glass p-6 text-center transition hover:-translate-y-1 hover:bg-white/[0.09]">
                <span className={`mx-auto grid size-16 place-items-center rounded-full bg-gradient-to-br text-night-900 shadow-[0_0_30px] shadow-haldi-500/30 ${GLOWS[i % GLOWS.length]}`}>
                  <Icon className="size-8" />
                </span>
                <h3 className="mt-5 text-2xl font-bold">{a.title}</h3>
                <p className="mt-2 text-ivory/70">{a.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
