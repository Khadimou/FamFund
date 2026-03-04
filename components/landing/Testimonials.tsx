import AnimatedSection from './AnimatedSection'

export default function Testimonials() {
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

          <p className="text-white/60 text-base max-w-md mx-auto leading-relaxed">
            Des fondateurs de toute la France qui préparent leur levée auprès de leurs proches.
          </p>
        </AnimatedSection>
      </div>
    </section>
  )
}
