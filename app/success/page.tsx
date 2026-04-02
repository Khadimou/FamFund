import Link from 'next/link'

export default function SuccessPage({
  searchParams,
}: {
  searchParams: { plan?: string; session_id?: string }
}) {
  const plan = searchParams.plan ?? 'en_famille'
  const isAvocat = plan === 'avec_avocat'

  return (
    <main style={{ background: '#FAF7F2', minHeight: '100vh', fontFamily: 'var(--font-inter), DM Sans, sans-serif', color: '#1a1a18', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>

      {/* Logo */}
      <Link href="/" style={{ fontFamily: 'var(--font-playfair), Lora, serif', fontSize: '1.25rem', color: '#2D6A4F', letterSpacing: '-0.02em', textDecoration: 'none', marginBottom: 56 }}>
        FamilyFund
      </Link>

      {/* Card */}
      <div style={{ background: '#fff', border: '1.5px solid #e8e2d9', borderRadius: 24, padding: '48px 40px', maxWidth: 520, width: '100%', textAlign: 'center' }}>

        {/* Check circle */}
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#e8f5ee', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
          <svg viewBox="0 0 24 24" fill="none" width={28} height={28}>
            <path d="M5 12l5 5L20 7" stroke="#2D6A4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 style={{ fontFamily: 'var(--font-playfair), Lora, serif', fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 12, color: '#1a1a18' }}>
          {isAvocat ? 'Votre dossier est entre de bonnes mains' : 'Bienvenue dans la famille'}
        </h1>

        <p style={{ fontSize: '1rem', color: '#6b6b65', lineHeight: 1.65, fontWeight: 300, marginBottom: 36 }}>
          {isAvocat
            ? 'Paiement confirmé. Un avocat partenaire va examiner votre dossier dans les 48 h ouvrées. Vous recevrez un email de confirmation avec les prochaines étapes.'
            : 'Votre plan En Famille est maintenant actif. Vous pouvez générer vos contrats, les faire signer, et suivre vos remboursements.'}
        </p>

        {/* Next steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36, textAlign: 'left' }}>
          {(isAvocat
            ? [
                { icon: '📋', label: 'Vérifiez votre boîte mail', sub: 'Un email de confirmation vous a été envoyé avec les instructions.' },
                { icon: '⚖️', label: 'L\'avocat vous contacte sous 48 h', sub: 'Il analysera votre projet et vous proposera un rendez-vous.' },
                { icon: '✅', label: 'Certificat de conformité', sub: 'Délivré à l\'issue de l\'accompagnement juridique.' },
              ]
            : [
                { icon: '📝', label: 'Générez vos contrats', sub: 'Tous les types de documents sont maintenant disponibles.' },
                { icon: '✍️', label: 'Faites signer vos proches', sub: 'Signature électronique eIDAS via Yousign.' },
                { icon: '📅', label: 'Suivez les remboursements', sub: 'Rappels automatiques 5 jours avant chaque échéance.' },
              ]
          ).map(step => (
            <div key={step.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px', background: '#FAF7F2', borderRadius: 12 }}>
              <span style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: 1 }}>{step.icon}</span>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: 2, color: '#1a1a18' }}>{step.label}</p>
                <p style={{ fontSize: '0.8rem', color: '#6b6b65', fontWeight: 300, lineHeight: 1.4 }}>{step.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/dashboard"
          style={{ display: 'block', width: '100%', padding: '14px 24px', borderRadius: 12, background: '#2D6A4F', color: '#fff', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem', letterSpacing: '0.01em', textAlign: 'center' }}
        >
          Accéder à mon tableau de bord
        </Link>
      </div>

      <p style={{ marginTop: 28, fontSize: '0.8rem', color: '#6b6b65', fontWeight: 300 }}>
        Une question ?{' '}
        <a href="mailto:contact@familyfund.fr" style={{ color: '#2D6A4F', textDecoration: 'none' }}>
          contact@familyfund.fr
        </a>
      </p>
    </main>
  )
}
