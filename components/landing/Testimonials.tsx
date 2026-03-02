import AnimatedSection from './AnimatedSection'
import { Users, TrendingUp, MapPin } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'

async function getWaitlistCount(): Promise<number> {
  try {
    const supabase = getSupabase()
    if (!supabase) return 0
    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
    return count ?? 0
  } catch {
    return 0
  }
}

const stats = [
  { Icon: TrendingUp, value: '33 500€', label: 'montant moyen levé' },
  { Icon: MapPin,     value: '12+',     label: 'villes en France' },
]

export default async function Testimonials() {
  const count = await getWaitlistCount()

  return (
    <section className="relative py-20 bg-[#132019] overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(244,162,97,0.06) 0%, transparent 100%)' }}
      />

      <div className="relative container mx-auto px-4 max-w-4xl">
        <AnimatedSection className="text-center">
          <p className="text-white/40 text-sm uppercase tracking-widest font-medium mb-4">
            Communauté
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-10">
            Rejoignez les premiers à tester FamilyFund
          </h2>

          <div className="inline-flex items-center gap-6 bg-[#0C1A10] border border-[#27412E] rounded-3xl px-10 py-7 shadow-2xl mb-10">
            <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center shrink-0">
              <Users size={28} className="text-accent" />
            </div>
            <div className="text-left">
              <p
                className="text-6xl font-bold leading-none mb-1 text-accent"
                style={{ textShadow: '0 0 40px rgba(244,162,97,0.4)' }}
              >
                {count}
              </p>
              <p className="text-white/60 text-sm">
                entrepreneurs ont déjà rejoint la liste d&apos;attente
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {stats.map(({ Icon, value, label }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 bg-[#0C1A10] border border-[#27412E] rounded-full px-5 py-2.5"
              >
                <Icon size={15} className="text-primary-light shrink-0" />
                <span className="text-white font-semibold text-sm">{value}</span>
                <span className="text-white/60 text-sm">{label}</span>
              </div>
            ))}
          </div>

          <p className="text-white/60 text-base max-w-md mx-auto leading-relaxed">
            Des fondateurs de toute la France qui préparent leur levée auprès de leurs proches.
          </p>
        </AnimatedSection>
      </div>
    </section>
  )
}
