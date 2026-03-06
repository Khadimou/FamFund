import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Politique de confidentialité — FamilyFund',
  robots: { index: false, follow: false },
}

export default function ConfidentialitePage() {
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
        <h1 className="font-serif text-4xl text-white mb-3">Politique de confidentialité</h1>
        <p className="text-white/40 text-sm mb-10">Dernière mise à jour : mars 2026</p>

        <div className="space-y-10 text-white/70 leading-relaxed">

          <section>
            <h2 className="font-serif text-xl text-white mb-3">1. Responsable du traitement</h2>
            <p>
              Le responsable du traitement des données collectées sur familyfund.fr est
              l&apos;éditeur du site, joignable à{' '}
              <a href="mailto:contact@familyfund.fr" className="text-primary-light hover:underline">
                contact@familyfund.fr
              </a>.
            </p>
            <p className="mt-3 text-white/40 text-sm italic">
              ⚠ Ces informations seront mises à jour avec les coordonnées de la structure juridique
              dès son immatriculation.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">2. Données collectées et finalités</h2>

            <div className="space-y-5">
              <div>
                <h3 className="text-white font-semibold mb-1">Accès anticipé (waitlist)</h3>
                <p>
                  Donnée : adresse email.<br />
                  Finalité : vous informer du lancement de FamilyFund et des mises à jour du projet.<br />
                  Base légale : consentement (article 6.1.a du RGPD).
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-1">Téléchargement du guide gratuit</h3>
                <p>
                  Donnée : adresse email.<br />
                  Finalité : livraison du guide par email et inscription à la liste d&apos;accès anticipé.<br />
                  Base légale : consentement (article 6.1.a du RGPD).
                </p>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-1">Formulaire de contact</h3>
                <p>
                  Données : nom, adresse email, message.<br />
                  Finalité : répondre à votre demande.<br />
                  Base légale : intérêt légitime (article 6.1.f du RGPD).
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">3. Durée de conservation</h2>
            <p>
              Les adresses email collectées via la waitlist ou le guide sont conservées
              jusqu&apos;au lancement de la plateforme, puis jusqu&apos;à désinscription de votre part.
              Les données de contact sont supprimées 12 mois après le dernier échange.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">4. Sous-traitants</h2>
            <p className="mb-4">
              Vos données peuvent être traitées par les prestataires suivants, liés par
              des clauses contractuelles conformes au RGPD :
            </p>
            <ul className="space-y-3">
              <li>
                <strong className="text-white">Supabase Inc.</strong> (stockage des emails de la waitlist) —
                <a href="https://supabase.com/privacy" className="text-primary-light hover:underline ml-1" target="_blank" rel="noopener noreferrer">politique de confidentialité</a>
              </li>
              <li>
                <strong className="text-white">Brevo SAS</strong> (envoi des emails transactionnels) —
                France, 55 rue d&apos;Amsterdam, 75008 Paris —
                <a href="https://www.brevo.com/fr/legal/privacypolicy/" className="text-primary-light hover:underline ml-1" target="_blank" rel="noopener noreferrer">politique de confidentialité</a>
              </li>
              <li>
                <strong className="text-white">Vercel Inc.</strong> (hébergement du site) —
                <a href="https://vercel.com/legal/privacy-policy" className="text-primary-light hover:underline ml-1" target="_blank" rel="noopener noreferrer">politique de confidentialité</a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">5. Vos droits</h2>
            <p className="mb-3">
              Conformément au RGPD, vous disposez des droits suivants sur vos données :
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Droit d&apos;accès</li>
              <li>Droit de rectification</li>
              <li>Droit à l&apos;effacement ("droit à l&apos;oubli")</li>
              <li>Droit à la portabilité</li>
              <li>Droit d&apos;opposition</li>
              <li>Droit de retirer votre consentement à tout moment</li>
            </ul>
            <p className="mt-4">
              Pour exercer ces droits, écrivez à{' '}
              <a href="mailto:contact@familyfund.fr" className="text-primary-light hover:underline">
                contact@familyfund.fr
              </a>. Nous répondons sous 30 jours.
            </p>
            <p className="mt-3">
              Vous pouvez également introduire une réclamation auprès de la{' '}
              <a href="https://www.cnil.fr" className="text-primary-light hover:underline" target="_blank" rel="noopener noreferrer">
                CNIL
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">6. Cookies et analytics</h2>
            <p>
              Ce site utilise Plausible Analytics, un outil respectueux de la vie privée
              qui ne dépose pas de cookie et ne collecte aucune donnée personnelle identifiable.
              Aucun consentement n&apos;est requis pour cet outil.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-white mb-3">7. Modifications</h2>
            <p>
              Cette politique peut être mise à jour, notamment lors de l&apos;immatriculation
              de la structure juridique ou de l&apos;ajout de nouveaux traitements.
              La date de dernière mise à jour est indiquée en haut de page.
            </p>
          </section>

        </div>
      </div>
    </main>
  )
}
