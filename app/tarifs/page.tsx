import Link from 'next/link'
import { Check, X, ArrowLeft } from 'lucide-react'
import FaqAccordion from '@/components/tarifs/FaqAccordion'

/* ── Feature list helpers ── */
function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <Check size={15} className="text-primary shrink-0 mt-0.5" />
      <span className="text-sm text-text">{children}</span>
    </li>
  )
}

function FeatureDark({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <Check size={15} className="text-[#52B788] shrink-0 mt-0.5" />
      <span className="text-sm text-white/80">{children}</span>
    </li>
  )
}

function FeatureOff({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <X size={15} className="text-gray-300 shrink-0 mt-0.5" />
      <span className="text-sm text-gray-400 line-through">{children}</span>
    </li>
  )
}

/* ── Why card ── */
function WhyCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <p className="font-semibold text-text mb-2">{title}</p>
      <p className="text-sm text-muted leading-relaxed">{body}</p>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════ */
export default function TarifsPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF8]">

      {/* ── Nav ── */}
      <div className="max-w-6xl mx-auto px-6 pt-8">
        <Link
          href="/documents"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft size={15} />
          Retour
        </Link>
      </div>

      {/* ── Hero ── */}
      <section className="max-w-3xl mx-auto px-6 pt-12 pb-16 text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm shadow-sm">
            F
          </div>
          <span className="font-serif text-xl text-[#1C3B2E] font-semibold">FamilyFund</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl text-[#1C3B2E] leading-tight mb-5">
          Structurez votre love money.<br />
          <span className="text-primary">Payez quand ça compte.</span>
        </h1>
        <p className="text-muted text-lg leading-relaxed max-w-xl mx-auto">
          Gratuit pour démarrer. Un seul paiement pour formaliser.{' '}
          <span className="text-text font-medium">4,90 €/mois</span> pour ne jamais perdre le fil.
        </p>
      </section>

      {/* ── Pricing grid ── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">

          {/* ── Plan 1 : Gratuit ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7 flex flex-col">
            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">Pour démarrer</p>
            <p className="font-serif text-2xl font-bold text-text mb-1">Gratuit</p>
            <div className="flex items-end gap-1 mb-6">
              <span className="font-serif text-4xl font-bold text-text">0 €</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              <Feature>1 projet actif</Feature>
              <Feature>Contributeurs illimités</Feature>
              <Feature>Invitations personnalisées par proche</Feature>
              <Feature>Dashboard de collecte en temps réel</Feature>
              <Feature>Lettre de synthèse bancaire exportable</Feature>
              <FeatureOff>Contrats et signatures</FeatureOff>
              <FeatureOff>Suivi des remboursements</FeatureOff>
            </ul>

            <Link
              href="/auth/login"
              className="block text-center px-5 py-3 rounded-xl bg-[#1C3B2E] text-white font-semibold text-sm hover:bg-[#152D23] transition-colors"
            >
              Commencer gratuitement
            </Link>
          </div>

          {/* ── Plan 2 : Pack Projet (featured) ── */}
          <div className="bg-[#1C3B2E] rounded-2xl shadow-xl p-7 flex flex-col relative md:-mt-4 md:-mb-4 md:py-11 border border-[#2D6A4F]">
            {/* Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-accent text-white text-xs font-bold px-4 py-1 rounded-full shadow-sm whitespace-nowrap">
                Le plus populaire
              </span>
            </div>

            <p className="text-xs font-semibold text-[#52B788] uppercase tracking-widest mb-4">Le plus populaire</p>
            <p className="font-serif text-2xl font-bold text-white mb-1">Pack Projet</p>
            <div className="flex items-end gap-2 mb-1">
              <span className="font-serif text-4xl font-bold text-white">49 €</span>
              <span className="text-white/50 text-sm mb-1.5">paiement unique</span>
            </div>
            <p className="text-white/50 text-xs mb-6">Par projet, contrats illimités inclus</p>

            <ul className="space-y-3 mb-8 flex-1">
              <FeatureDark>Tout le plan Gratuit</FeatureDark>
              <FeatureDark>Contrats illimités (prêt, don, pacte d'associé)</FeatureDark>
              <FeatureDark>Signature électronique Yousign eIDAS</FeatureDark>
              <FeatureDark>Archivage légal horodaté</FeatureDark>
              <FeatureDark>Rappel Cerfa 2062 intégré</FeatureDark>
              <FeatureDark>Accès au Suivi remboursements (4,90 €/mois)</FeatureDark>
            </ul>

            <Link
              href="/auth/login"
              className="block text-center px-5 py-3 rounded-xl bg-white text-[#1C3B2E] font-bold text-sm hover:bg-white/90 transition-colors shadow-sm"
            >
              Formaliser mon projet — 49 €
            </Link>

            <p className="text-white/30 text-xs text-center mt-4 italic">
              Paiement unique par projet. Aucun abonnement imposé.
            </p>
          </div>

          {/* ── Plan 3 : Suivi mensuel ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7 flex flex-col">
            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">Pour rembourser sereinement</p>
            <p className="font-serif text-2xl font-bold text-text mb-1">Suivi mensuel</p>
            <div className="flex items-end gap-1 mb-1">
              <span className="font-serif text-4xl font-bold text-text">4,90 €</span>
              <span className="text-muted text-sm mb-1.5">/ mois</span>
            </div>
            <p className="text-muted text-xs mb-6">Résiliable à tout moment</p>

            <ul className="space-y-3 mb-8 flex-1">
              <Feature>Tableau de remboursements mois par mois</Feature>
              <Feature>Rappels automatiques 5 jours avant échéance</Feature>
              <Feature>Dashboard famille partagé</Feature>
              <Feature>Alertes réglementaires automatiques</Feature>
              <Feature>Export PDF de l'échéancier complet</Feature>
            </ul>

            <Link
              href="/auth/login"
              className="block text-center px-5 py-3 rounded-xl bg-[#1C3B2E] text-white font-semibold text-sm hover:bg-[#152D23] transition-colors"
            >
              Activer le suivi
            </Link>

            <p className="text-gray-400 text-xs text-center mt-4 italic">
              Disponible uniquement après activation du Pack Projet
            </p>
          </div>

        </div>
      </section>

      {/* ── Pourquoi c'est le bon prix ── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="font-serif text-3xl text-[#1C3B2E] text-center mb-3">Pourquoi c'est le bon prix</h2>
        <p className="text-muted text-center mb-10 max-w-xl mx-auto text-sm">
          Pas de frais cachés. Pas d'abonnement piège. Juste ce qu'il faut, quand il le faut.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <WhyCard
            title="49 € vs 300 €"
            body="Un notaire facture 150 à 300 € pour le même acte. FamilyFund génère le contrat, le fait signer, et l'archive — pour 49 €."
          />
          <WhyCard
            title="0,2 % de votre levée"
            body="Pour une levée moyenne de 25 000 €, le Pack Projet représente 0,2 % du montant structuré."
          />
          <WhyCard
            title="Aucun abonnement imposé"
            body="Vous ne payez le suivi que si vous en avez besoin. Pas d'engagement, résiliation en 1 clic."
          />
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="font-serif text-3xl text-[#1C3B2E] text-center mb-10">Questions fréquentes</h2>
        <FaqAccordion />
      </section>

      {/* ── Social proof ── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <p className="text-center text-sm text-muted uppercase tracking-widest font-semibold mb-8">
          Ils nous font confiance
        </p>
        <div className="flex flex-wrap items-center justify-center gap-10 opacity-40 grayscale">
          {['Yousign', 'BPI France', 'Legalstart', 'Alma'].map(name => (
            <span key={name} className="font-semibold text-lg text-gray-500 tracking-tight">
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* ── Footer strip ── */}
      <div className="border-t border-gray-100 py-6 text-center">
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} FamilyFund ·
          <Link href="/" className="hover:text-primary ml-1 transition-colors">Accueil</Link>
        </p>
      </div>

    </main>
  )
}
