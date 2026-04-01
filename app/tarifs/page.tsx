import Link from 'next/link'

/* ── SVG helpers ── */
function CheckIcon({ white }: { white?: boolean }) {
  return (
    <svg viewBox="0 0 10 8" fill="none" width={10} height={10}>
      <path d="M1 4l3 3 5-6" stroke={white ? 'white' : '#2D6A4F'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function CrossIcon() {
  return (
    <svg viewBox="0 0 10 10" fill="none" width={10} height={10}>
      <path d="M2 2l6 6M8 2l-6 6" stroke="#6b6b65" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/* ── Feature row ── */
function Feat({ children, off, dark }: { children: React.ReactNode; off?: boolean; dark?: boolean }) {
  return (
    <li className="flex items-start gap-2.5" style={{ opacity: off ? 0.55 : 1 }}>
      <span style={{
        width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: off ? '#e8e2d9' : dark ? 'rgba(255,255,255,0.18)' : '#e8f5ee',
      }}>
        {off ? <CrossIcon /> : <CheckIcon white={dark} />}
      </span>
      <span style={{
        fontSize: '0.875rem', lineHeight: 1.4,
        color: off ? '#6b6b65' : dark ? 'rgba(255,255,255,0.88)' : '#1a1a18',
        textDecoration: off ? 'line-through' : 'none',
      }}>
        {children}
      </span>
    </li>
  )
}

function Separator({ dark }: { dark?: boolean }) {
  return <div style={{ height: 1, background: dark ? 'rgba(255,255,255,0.12)' : '#e8e2d9', margin: '4px 0' }} />
}

/* ══════════════════════════════════════════════════════════════════════ */
export default function TarifsPage() {
  return (
    <main style={{ background: '#FAF7F2', minHeight: '100vh', fontFamily: 'var(--font-inter), DM Sans, sans-serif', color: '#1a1a18' }}>

      {/* ── Nav ── */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 48px', borderBottom: '1px solid #e8e2d9', background: '#FAF7F2' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-playfair), Lora, serif', fontSize: '1.25rem', color: '#2D6A4F', letterSpacing: '-0.02em', textDecoration: 'none' }}>
          FamilyFund
        </Link>
        <Link href="/auth/login" style={{ fontSize: '0.875rem', color: '#6b6b65', textDecoration: 'none' }}>
          Se connecter
        </Link>
      </nav>

      {/* ── Hero ── */}
      <div style={{ textAlign: 'center', padding: '80px 24px 64px', maxWidth: 680, margin: '0 auto' }}>
        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#F4A261', fontWeight: 500, marginBottom: 20 }}>
          Tarifs
        </p>
        <h1 style={{ fontFamily: 'var(--font-playfair), Lora, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 600, lineHeight: 1.2, color: '#1a1a18', marginBottom: 20, letterSpacing: '-0.02em' }}>
          Protéger ce qu&apos;on a de plus précieux —{' '}
          <em style={{ color: '#2D6A4F', fontStyle: 'italic' }}>les liens</em>
        </h1>
        <p style={{ fontSize: '1.05rem', color: '#6b6b65', lineHeight: 1.65, fontWeight: 300, maxWidth: 520, margin: '0 auto' }}>
          Votre famille vous fait confiance. FamilyFund vous aide à honorer cette confiance : un cadre clair, une preuve légale, et zéro ambiguïté.
        </p>
      </div>

      {/* ── Plans ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.08fr 1fr', gap: 16, alignItems: 'start' }}>

          {/* Plan 1 — Gratuit */}
          <PlanCard>
            <p style={labelStyle()}>Pour démarrer</p>
            <h2 style={nameStyle()}>Premiers pas</h2>
            <p style={taglineStyle()}>Posez les bases avant de vous lancer dans la conversation.</p>

            <div style={priceBlock()}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={amountStyle()}>0</span>
                <span style={currencyStyle()}>€</span>
              </div>
              <p style={priceNoteStyle()}>Gratuit, sans engagement</p>
            </div>

            <a href="/auth/login" style={{ ...btnBase, border: '1.5px solid #e8e2d9', background: 'transparent', color: '#1a1a18' }}>
              Commencer gratuitement
            </a>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Feat>1 projet actif</Feat>
              <Feat>Jusqu&apos;à 3 contributeurs</Feat>
              <Feat>Dashboard de collecte en temps réel</Feat>
              <Feat>
                Lettre de synthèse exportable{' '}
                <span style={{ marginLeft: 4, fontSize: '0.72rem', color: '#2D6A4F', background: '#e8f5ee', padding: '2px 7px', borderRadius: 20, fontWeight: 500 }}>
                  Toujours gratuit
                </span>
              </Feat>
              <Feat off>Contrats et signatures</Feat>
              <Feat off>Suivi des remboursements</Feat>
            </ul>
          </PlanCard>

          {/* Plan 2 — En Famille (featured) */}
          <PlanCard featured>
            <div style={{ display: 'inline-block', background: '#F4A261', color: '#fff', fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '5px 12px', borderRadius: 100, marginBottom: 20 }}>
              Le plus choisi
            </div>
            <p style={labelStyle(true)}>Pour formaliser sereinement</p>
            <h2 style={nameStyle(true)}>En Famille</h2>
            <p style={taglineStyle(true)}>Tout ce qu&apos;il faut pour que chacun sache exactement où il en est.</p>

            <div style={priceBlock(true)}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={currencyStyle(true)}>€</span>
                <span style={amountStyle(true)}>19</span>
              </div>
              <p style={priceNoteStyle(true)}>par mois · résiliable à tout moment</p>
            </div>

            <a href="/auth/login" style={{ ...btnBase, background: '#fff', color: '#2D6A4F', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
              Protéger mon projet
            </a>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Feat dark>Contributeurs illimités</Feat>
              <Feat dark>Tous les documents (prêt, don, pacte d&apos;associé)</Feat>
              <Feat dark>Signature électronique eIDAS (Yousign)</Feat>
              <Feat dark>Archivage légal horodaté</Feat>
              <Separator dark />
              <Feat dark>Tableau de remboursements mois par mois</Feat>
              <Feat dark>Rappels automatiques 5 jours avant échéance</Feat>
              <Feat dark>Alertes réglementaires automatiques</Feat>
              <Feat dark>Export PDF de l&apos;échéancier complet</Feat>
              <Feat dark>Rappel Cerfa 2062 intégré</Feat>
            </ul>
          </PlanCard>

          {/* Plan 3 — Avec un avocat */}
          <PlanCard>
            <p style={labelStyle()}>Pour les montants importants</p>
            <h2 style={nameStyle()}>Avec un avocat</h2>
            <p style={taglineStyle()}>Quand l&apos;enjeu dépasse les 15 000 € et que la famille mérite plus qu&apos;un contrat.</p>

            <div style={priceBlock()}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={currencyStyle()}>€</span>
                <span style={amountStyle()}>249</span>
              </div>
              <p style={priceNoteStyle()}>paiement unique · par projet</p>
            </div>

            <a href="/auth/login" style={{ ...btnBase, background: '#F4A261', color: '#fff', boxShadow: '0 4px 16px rgba(244,162,97,0.35)' }}>
              Sécuriser avec un avocat
            </a>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Feat>Tout le plan En Famille inclus</Feat>
              <Separator />
              <Feat>Validation par un avocat partenaire</Feat>
              <Feat>1h d&apos;assistance juridique personnalisée</Feat>
              <Feat>Certificat de conformité délivré</Feat>
            </ul>

            <div style={{ marginTop: 20, padding: '12px 14px', background: '#fde8d5', borderRadius: 10, fontSize: '0.78rem', color: '#8a5a2a', lineHeight: 1.45 }}>
              💡 Suggéré automatiquement dès que votre levée dépasse 15 000 € — au moment où la vigilance compte vraiment.
            </div>
          </PlanCard>
        </div>

        {/* ── Trust stats ── */}
        <div style={{ marginTop: 56, textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-playfair), Lora, serif', fontSize: '1.4rem', fontWeight: 600, marginBottom: 40, color: '#1a1a18', letterSpacing: '-0.01em' }}>
            Pourquoi c&apos;est le bon prix
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { num: '49 → 300 €', label: 'Ce que facture un notaire', desc: 'Un notaire facture 150 à 300 € pour le même acte. FamilyFund le génère, le fait signer, et l\'archive — pour 19 €/mois.' },
              { num: '1 famille sur 3', label: 'Connaît un conflit lié à l\'argent', desc: 'Source BNP Paribas. Un contrat clair ne garantit pas tout — mais il évite 90 % des malentendus qui dégénèrent.' },
              { num: 'Aucun abonnement imposé', label: 'Vous payez quand ça compte', desc: 'Commencez gratuitement. Passez au plan En Famille quand votre levée prend forme. Résiliez à tout moment.' },
            ].map(c => (
              <div key={c.label} style={{ background: '#fff', border: '1.5px solid #e8e2d9', borderRadius: 16, padding: '28px 24px', textAlign: 'left' }}>
                <p style={{ fontFamily: 'var(--font-playfair), Lora, serif', fontSize: '1.8rem', fontWeight: 600, color: '#2D6A4F', letterSpacing: '-0.02em', marginBottom: 6 }}>{c.num}</p>
                <p style={{ fontSize: '0.9rem', fontWeight: 500, color: '#1a1a18', marginBottom: 6 }}>{c.label}</p>
                <p style={{ fontSize: '0.8rem', color: '#6b6b65', lineHeight: 1.5, fontWeight: 300 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Reassurance bar ── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap', maxWidth: 1100, margin: '0 auto 48px', padding: '0 24px' }}>
        {[
          'Aucun fonds ne transit par FamilyFund',
          'Données hébergées en France',
          'Signature conforme eIDAS',
          'Résiliation en 1 clic',
        ].map(item => (
          <span key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.825rem', color: '#6b6b65', fontWeight: 300 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2D6A4F', flexShrink: 0 }} />
            {item}
          </span>
        ))}
      </div>

    </main>
  )
}

/* ── Plan card wrapper ── */
function PlanCard({ children, featured }: { children: React.ReactNode; featured?: boolean }) {
  return (
    <div style={{
      background:    featured ? '#2D6A4F' : '#fff',
      borderRadius:  20,
      padding:       featured ? '44px 32px' : '36px 32px',
      border:        featured ? '1.5px solid #2D6A4F' : '1.5px solid #e8e2d9',
      color:         featured ? '#fff' : '#1a1a18',
      boxShadow:     featured ? '0 20px 60px rgba(45,106,79,0.25)' : 'none',
      display:       'flex',
      flexDirection: 'column' as const,
      gap:           0,
    }}>
      {children}
    </div>
  )
}

/* ── Style helpers ── */
const labelStyle = (dark?: boolean): React.CSSProperties => ({
  fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em',
  color: dark ? 'rgba(255,255,255,0.6)' : '#6b6b65', marginBottom: 8, fontWeight: 500,
})
const nameStyle = (dark?: boolean): React.CSSProperties => ({
  fontFamily: 'var(--font-playfair), Lora, serif', fontSize: '1.5rem', fontWeight: 600,
  marginBottom: 6, letterSpacing: '-0.02em', color: dark ? '#fff' : '#1a1a18',
})
const taglineStyle = (dark?: boolean): React.CSSProperties => ({
  fontSize: '0.875rem', color: dark ? 'rgba(255,255,255,0.72)' : '#6b6b65',
  marginBottom: 28, fontWeight: 300, lineHeight: 1.5,
})
const priceBlock = (dark?: boolean): React.CSSProperties => ({
  marginBottom: 28, paddingBottom: 24,
  borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.15)' : '#e8e2d9'}`,
})
const amountStyle = (dark?: boolean): React.CSSProperties => ({
  fontFamily: 'var(--font-playfair), Lora, serif', fontSize: '3.2rem', fontWeight: 600,
  color: dark ? '#fff' : '#1a1a18', lineHeight: 1, letterSpacing: '-0.03em',
})
const currencyStyle = (dark?: boolean): React.CSSProperties => ({
  fontSize: '1.1rem', fontWeight: 500,
  color: dark ? 'rgba(255,255,255,0.85)' : '#2D6A4F', marginTop: 4,
})
const priceNoteStyle = (dark?: boolean): React.CSSProperties => ({
  fontSize: '0.8rem', color: dark ? 'rgba(255,255,255,0.55)' : '#6b6b65', fontWeight: 300,
})
const btnBase: React.CSSProperties = {
  display: 'block', width: '100%', textAlign: 'center', padding: '14px 24px',
  borderRadius: 12, fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none',
  cursor: 'pointer', marginBottom: 28, letterSpacing: '0.01em', border: 'none',
}
