import WaitlistForm from './WaitlistForm'
import FamilyTreeSVG from './FamilyTreeSVG'
import AnimatedSection from './AnimatedSection'
import { CheckCircle } from 'lucide-react'

const REASSURANCES = [
  'Accès gratuit',
  'Aucune carte bancaire',
  'Vos proches ne voient pas les données des autres',
]

export default function Hero() {
  return (
    <section className="relative min-h-[92vh] bg-[#0C1A10] flex items-center overflow-hidden">

      {/* Radial glow — droite */}
      <div
        className="absolute right-[-5%] top-1/2 -translate-y-1/2 w-[640px] h-[640px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(45,106,79,0.35) 0%, transparent 70%)' }}
      />
      {/* Radial glow — gauche haut */}
      <div
        className="absolute left-[-10%] top-[-10%] w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(64,145,108,0.12) 0%, transparent 65%)' }}
      />

      <div className="relative container mx-auto px-4 py-20 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          <AnimatedSection>
            <div className="space-y-7">
              <span className="inline-block bg-accent/15 text-accent border border-accent/30 rounded-full px-4 py-1.5 text-sm font-medium">
                Bêta privée · Rejoignez la liste d&apos;attente
              </span>

              <h1 className="font-serif text-5xl md:text-6xl text-white leading-[1.1]">
                Levez vos premiers fonds auprès de votre famille.{' '}
                <em className="text-primary-light">Sans les conflits.</em>
              </h1>

              <p className="text-lg text-white/70 leading-relaxed max-w-lg">
                FamilyFund structure votre love money : chaque proche renseigne ce qu&apos;il peut
                investir — sans conversations gênantes — vous pilotez tout depuis un tableau
                de bord privé.
              </p>

              <div id="hero-form">
                <WaitlistForm source="hero" dark />
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
                {REASSURANCES.map((item) => (
                  <span key={item} className="flex items-center gap-1.5 text-sm text-white/60">
                    <CheckCircle size={15} className="text-primary-light shrink-0" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.15} className="flex justify-center lg:justify-end">
            <FamilyTreeSVG />
          </AnimatedSection>

        </div>
      </div>
    </section>
  )
}
