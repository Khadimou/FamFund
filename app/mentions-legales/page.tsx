import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mentions légales — FamilyFund',
  robots: { index: false, follow: false },
}

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-[#0C1A10]">
      <nav className="border-b border-[#1A2D22] px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="font-serif text-xl text-primary-light font-bold tracking-tight">
            FamilyFund
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 max-w-3xl py-16">
        <h1 className="font-serif text-4xl text-white mb-10">Mentions légales</h1>

        <div className="space-y-10 text-white/70 leading-relaxed">

          <section>
            <h2 className="font-serif text-xl text-white mb-3">Éditeur du site</h2>
            <p>
              Le site familyfund.fr est édité à titre personnel dans le cadre d&apos;un projet
              en cours d&apos;immatriculation.
            </p>
            <p className="mt-2">
              Email : <a href="mailto:contact@familyfund.fr" className="text-primary-light hover:underline">contact@familyfund.fr</a>
            </p>
            <p className="mt-3 text-white/40 text-sm italic">
              ⚠ Ces informations seront mises à jour avec la raison sociale, le numéro SIRET
              et l&apos;adresse du siège social dès l&apos;immatriculation de la structure.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">Directeur de la publication</h2>
            <p>
              Le directeur de la publication est le créateur du projet, joignable à l&apos;adresse{' '}
              <a href="mailto:contact@familyfund.fr" className="text-primary-light hover:underline">
                contact@familyfund.fr
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">Hébergement</h2>
            <p>
              Le site est hébergé par :<br />
              <strong className="text-white">Vercel Inc.</strong><br />
              340 Pine Street, Suite 701<br />
              San Francisco, California 94104 — États-Unis<br />
              <a href="https://vercel.com" className="text-primary-light hover:underline" target="_blank" rel="noopener noreferrer">vercel.com</a>
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble des contenus présents sur ce site (textes, visuels, logo, structure)
              est la propriété exclusive de l&apos;éditeur. Toute reproduction, même partielle,
              est interdite sans autorisation préalable.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">Limitation de responsabilité</h2>
            <p>
              Les informations publiées sur ce site sont fournies à titre indicatif.
              FamilyFund ne saurait être tenu responsable d&apos;erreurs, d&apos;omissions
              ou des résultats obtenus suite à l&apos;utilisation de ces informations.
              Les contenus relatifs à la fiscalité et au cadre légal ne constituent pas
              un conseil juridique ou fiscal personnalisé.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">Contact</h2>
            <p>
              Pour toute question relative au site :{' '}
              <a href="mailto:contact@familyfund.fr" className="text-primary-light hover:underline">
                contact@familyfund.fr
              </a>
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
