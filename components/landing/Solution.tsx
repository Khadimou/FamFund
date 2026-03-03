import AnimatedSection from './AnimatedSection'
import { Lock } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Vous créez un espace privé pour votre famille en 2 minutes',
    description:
      "Une invitation par lien sécurisé. Chaque membre rejoint sans friction, sans télécharger d'application.",
  },
  {
    number: '02',
    title: 'Chaque proche indique ce qu\'il peut donner ou prêter — sans que les autres le voient',
    description:
      'De manière totalement confidentielle. Aucun membre ne voit les données des autres.',
  },
  {
    number: '03',
    title: 'Vous voyez en un coup d\'œil qui peut vous aider et combien',
    description:
      'Vue consolidée de tous les engagements, statuts et montants disponibles — accessible uniquement par vous.',
  },
]

export default function Solution() {
  return (
    <section className="py-20 bg-[#0C1A10]">
      <div className="container mx-auto px-4 max-w-4xl">

        <AnimatedSection className="text-center mb-14">
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-3">
            Comment ça marche — en 3 étapes simples
          </h2>
          <p className="text-white/60 text-lg">Un processus simple, en trois étapes.</p>
        </AnimatedSection>

        <div className="relative space-y-4">
          {/* Ligne verticale connectant les étapes */}
          <div className="absolute left-[26px] top-8 bottom-8 w-px bg-gradient-to-b from-primary via-primary/40 to-transparent hidden md:block" />

          {steps.map(({ number, title, description }, i) => (
            <AnimatedSection key={number} delay={i * 0.12}>
              <div className="flex gap-5 items-start bg-[#132019] rounded-2xl p-6 border border-[#27412E] hover:border-primary/50 transition-colors group">
                <div className="shrink-0 w-14 h-14 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                  <span className="font-serif text-white font-bold text-xl">{number}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg mb-1.5 group-hover:text-white transition-colors">
                    {title}
                  </h3>
                  <p className="text-white/60 leading-relaxed">{description}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={0.4} className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2.5 text-sm text-white/60 bg-[#132019] border border-[#27412E] rounded-full px-5 py-2.5">
            <Lock size={14} className="text-primary-light shrink-0" />
            Toutes les données sont privées. Seul vous voyez la vue consolidée.
          </div>
        </AnimatedSection>

      </div>
    </section>
  )
}
