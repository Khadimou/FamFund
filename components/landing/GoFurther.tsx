import AnimatedSection from './AnimatedSection'
import { ArrowUpRight } from 'lucide-react'

export default function GoFurther() {
  return (
    <section className="py-20 bg-[#0F1D14]">
      <div className="container mx-auto px-4 max-w-3xl">
        <AnimatedSection className="text-center">
          <p className="text-white/40 text-sm uppercase tracking-widest font-medium mb-4">
            Aller plus loin
          </p>

          <h2 className="font-serif text-3xl md:text-4xl text-white mb-4 leading-snug">
            Votre projet mérite aussi d&apos;être connu{' '}
            <em className="text-primary-light not-italic">au-delà de vos proches.</em>
          </h2>

          <p className="text-white/60 text-lg mb-10 leading-relaxed max-w-xl mx-auto">
            AppelProjet.fr référence les appels à projets, subventions et concours
            ouverts aux entrepreneurs — une ressource complémentaire pour financer
            votre ambition.
          </p>

          <a
            href="https://appelprojet.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors shadow-lg shadow-primary/20"
          >
            Découvrir AppelProjet.fr
            <ArrowUpRight size={18} />
          </a>
        </AnimatedSection>
      </div>
    </section>
  )
}
