import AnimatedSection from './AnimatedSection'
import WaitlistForm from './WaitlistForm'

export default function CTAFinal() {
  return (
    <section className="relative py-24 bg-primary-dark overflow-hidden">
      {/* Glow overhead */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% -5%, rgba(64,145,108,0.55) 0%, transparent 100%)',
        }}
      />
      {/* Corner amber glow */}
      <div
        className="absolute bottom-0 left-0 w-80 h-80 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(244,162,97,0.08) 0%, transparent 70%)' }}
      />

      <div className="relative container mx-auto px-4 max-w-3xl">
        <AnimatedSection className="text-center">

          <h2 className="font-serif text-4xl md:text-5xl text-white mb-10 leading-tight">
            Soyez parmi les premiers à organiser le soutien financier de vos proches — proprement.
          </h2>

          <div className="flex justify-center mb-6">
            <WaitlistForm source="cta-final" dark />
          </div>

          <p className="text-white/30 text-xs max-w-sm mx-auto">
            En vous inscrivant, vous acceptez de recevoir des informations sur le lancement.
            Désabonnement en un clic depuis chaque email.
          </p>

        </AnimatedSection>
      </div>
    </section>
  )
}
