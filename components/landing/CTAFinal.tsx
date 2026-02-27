'use client'

import { useState } from 'react'
import AnimatedSection from './AnimatedSection'
import WaitlistForm from './WaitlistForm'

export default function CTAFinal() {
  const [spots] = useState(487)

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

          {/* Spots badge */}
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-white/60 text-sm">Accès prioritaire ·</span>
            <span className="text-accent font-bold text-sm">{spots} places restantes</span>
          </div>

          <h2 className="font-serif text-4xl md:text-5xl text-white mb-5 leading-tight">
            Soyez parmi les premiers à structurer votre love money
          </h2>

          <p className="text-white/70 text-lg mb-10 leading-relaxed max-w-xl mx-auto">
            Les 500 premiers inscrits bénéficient d&apos;un accès prioritaire et d&apos;un
            accompagnement personnalisé au lancement.
          </p>

          <div className="flex justify-center mb-6">
            <WaitlistForm source="cta-final" dark />
          </div>

          <p className="text-white/50 text-sm mb-4">
            <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-2 align-middle animate-pulse" />
            23 personnes ont rejoint la liste cette semaine
          </p>

          <p className="text-white/30 text-xs max-w-sm mx-auto">
            En vous inscrivant, vous acceptez de recevoir des informations sur le lancement.
            Désabonnement en un clic depuis chaque email.
          </p>

        </AnimatedSection>
      </div>
    </section>
  )
}
