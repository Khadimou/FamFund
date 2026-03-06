import type { Metadata } from 'next'
import { CheckCircle, FileText } from 'lucide-react'
import GuideForm from '@/components/landing/GuideForm'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Guide gratuit : Love Money & financement familial — FamilyFund',
  description:
    'Téléchargez notre guide complet : cadre légal du prêt familial, fiscalité love money 2026 et modèles de contrats prêts à l\'emploi.',
}

const CONTENTS = [
  'Le cadre légal du prêt familial en France',
  'Fiscalité love money : ce que vous devez déclarer en 2026',
  'Modèles de contrats de prêt et de don prêts à l\'emploi',
  'Comment aborder le sujet avec vos proches sans créer de tensions',
  'Checklist avant de lancer votre levée de fonds familiale',
]

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-[#0C1A10] flex flex-col">

      {/* Nav minimaliste */}
      <nav className="border-b border-[#1A2D22] px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="font-serif text-xl text-primary-light font-bold tracking-tight">
            FamilyFund
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex items-center py-20">
        <div className="container mx-auto px-4 max-w-2xl text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-8">
            <FileText size={14} className="text-accent" />
            <span className="text-accent text-sm font-medium">Guide gratuit · PDF · 2026</span>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight mb-5">
            Le guide pratique du{' '}
            <em className="text-primary-light not-italic">Love Money</em>
          </h1>

          <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            Tout ce que vous devez savoir pour structurer le financement de vos proches —
            légalement, sans tensions et sans mauvaises surprises fiscales.
          </p>

          {/* Contenu du guide */}
          <div className="bg-[#132019] border border-[#27412E] rounded-2xl p-6 mb-10 text-left">
            <p className="text-white/50 text-xs uppercase tracking-widest font-medium mb-4">
              Ce que contient le guide
            </p>
            <ul className="space-y-3">
              {CONTENTS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-white/80 text-sm leading-relaxed">
                  <CheckCircle size={16} className="text-primary-light shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Formulaire */}
          <GuideForm />

        </div>
      </section>

    </main>
  )
}
