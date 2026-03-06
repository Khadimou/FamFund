'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import AnimatedSection from './AnimatedSection'

const faqs = [
  {
    q: 'Est-ce que FamilyFund remplace un contrat de prêt officiel ?',
    a: "Non, la plateforme est un outil d'organisation et de transparence. Nous vous fournissons les modèles de documents légaux à signer hors plateforme.",
  },
  {
    q: 'Mes données financières sont-elles visibles par toute la famille ?',
    a: 'Chaque membre voit uniquement ses propres données. Seul le porteur de projet voit la synthèse consolidée.',
  },
  {
    q: "C'est gratuit ?",
    a: "L'accès anticipé est gratuit. Le modèle de prix sera annoncé au lancement.",
  },
  {
    q: 'Pour quel type de projet ?',
    a: "Création, reprise, financement d'études, projet immobilier — tout projet nécessitant un financement structuré entre proches.",
  },
  {
    q: 'Est-ce légal ?',
    a: 'Oui. La love money est encadrée en France. Nous vous guidons dans les obligations déclaratives applicables à votre situation.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="py-20 bg-[#0F1D14]">
      <div className="container mx-auto px-4 max-w-3xl">
        <AnimatedSection className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl text-white">Questions fréquentes</h2>
        </AnimatedSection>

        <div className="space-y-3">
          {faqs.map(({ q, a }, i) => (
            <AnimatedSection key={i} delay={i * 0.05}>
              <div
                className={`bg-[#132019] rounded-2xl border overflow-hidden transition-all duration-200 ${
                  open === i ? 'border-primary/60 shadow-lg shadow-primary/10' : 'border-[#27412E]'
                }`}
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-[#1B2D22] transition-colors"
                  aria-expanded={open === i}
                >
                  <span className="font-medium text-white">{q}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 transition-all duration-300 ${
                      open === i ? 'rotate-180 text-primary-light' : 'text-white/40'
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    open === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="px-6 pb-5 text-white/70 leading-relaxed border-t border-[#27412E] pt-4">
                    {a}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
