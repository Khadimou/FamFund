import { MessageCircle, Clock, FileText } from 'lucide-react'
import AnimatedSection from './AnimatedSection'

const problems = [
  {
    Icon: MessageCircle,
    title: 'Vous ne savez pas qui peut vraiment aider, ni combien',
    sub: 'Impossible de planifier sans avoir les chiffres.',
  },
  {
    Icon: Clock,
    title: 'Les conversations sont maladroites et répétées',
    sub: 'Chaque discussion crée une tension latente.',
  },
  {
    Icon: FileText,
    title: "Rien n'est formalisé, les attentes divergent",
    sub: 'Sans cadre, les malentendus surviennent inévitablement.',
  },
]

export default function Problems() {
  return (
    <section className="py-20 bg-[#0F1D14]">
      <div className="container mx-auto px-4 max-w-5xl">
        <AnimatedSection className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl text-white leading-snug">
            Emprunter à sa famille, c&apos;est souvent{' '}
            <em className="text-accent not-italic">le début des malentendus</em>
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {problems.map(({ Icon, title, sub }, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <div className="bg-[#0C1A10] rounded-2xl p-7 border border-[#27412E] border-l-4 border-l-accent h-full hover:border-accent/40 transition-colors">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-5">
                  <Icon className="text-accent" size={22} />
                </div>
                <p className="text-white font-semibold leading-snug mb-2">{title}</p>
                <p className="text-white/60 text-sm leading-relaxed">{sub}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
