'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Scale, X, FileText, Users, Euro,
  Calendar, PenLine, Shield, Lock,
} from 'lucide-react'

/* ── Constants ── */
const DOC_TYPE_LABELS: Record<string, string> = {
  loan_agreement:   'Contrat de prêt familial',
  gift_declaration: 'Déclaration de don',
  term_sheet:       'Lettre de conditions',
}

const LEGAL_THRESHOLD = 15_000
const fmt = (n: number) => n.toLocaleString('fr-FR')

/* ── Number to French words (up to 999 999) ── */
const UNITS  = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
                'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize',
                'dix-sept', 'dix-huit', 'dix-neuf']
const TENS   = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante',
                'soixante', 'quatre-vingt', 'quatre-vingt']

function belowHundred(n: number): string {
  if (n < 20) return UNITS[n]
  const t = Math.floor(n / 10)
  const u = n % 10
  if (t === 7) return u === 1 ? 'soixante et onze' : `soixante-${UNITS[10 + u]}`
  if (t === 8) return u === 0 ? 'quatre-vingts' : `quatre-vingt-${UNITS[u]}`
  if (t === 9) return `quatre-vingt-${UNITS[10 + u]}`
  return u === 0 ? TENS[t] : u === 1 ? `${TENS[t]} et un` : `${TENS[t]}-${UNITS[u]}`
}

function belowThousand(n: number): string {
  const h = Math.floor(n / 100)
  const r = n % 100
  if (h === 0)   return belowHundred(r)
  if (h === 1)   return r === 0 ? 'cent' : `cent ${belowHundred(r)}`
  const hStr = `${UNITS[h]} cent`
  return r === 0 ? `${hStr}s` : `${hStr} ${belowHundred(r)}`
}

function toWords(n: number): string {
  if (n === 0) return 'zéro'
  const k = Math.floor(n / 1000)
  const r = n % 1000
  if (k === 0) return belowThousand(r)
  const kStr = k === 1 ? 'mille' : `${belowThousand(k)} mille`
  return r === 0 ? kStr : `${kStr} ${belowThousand(r)}`
}

function amountInWords(n: number): string {
  return toWords(Math.round(n)).toUpperCase() + ' EUROS'
}

/* ── Mensualité ── */
function calcMensualite(amount: number, months: number, rate: number): number {
  if (months <= 0) return 0
  if (rate === 0)  return amount / months
  const r = rate / 100 / 12
  return (amount * r) / (1 - Math.pow(1 + r, -months))
}

/* ── Types ── */
interface FamilyMemberRow { id: string; first_name: string | null; last_name: string | null; email: string | null }

interface DocRow {
  id: string
  type: string
  amount: number | null
  duration_months: number | null
  interest_rate: number | null
  status: string
  lender_signed_at: string | null
  borrower_signed_at: string | null
  created_at: string
  project_id: string
  // Supabase returns FK joins as arrays
  family_members: FamilyMemberRow[] | FamilyMemberRow | null
}

interface Props {
  doc:          DocRow
  project:      { id: string; name: string; goal_amount: number | null }
  ownerProfile: { first_name: string | null; last_name: string | null }
}

/* ══════════════════════════════════════════════════════════════════════ */
export default function DocumentDetail({ doc, project, ownerProfile }: Props) {
  const [legalDismissed, setLegalDismissed] = useState(false)

  const member   = Array.isArray(doc.family_members) ? doc.family_members[0] ?? null : doc.family_members
  const amount   = doc.amount          ?? 0
  const months   = doc.duration_months ?? 0
  const rate     = doc.interest_rate   ?? 0
  const isSigned = !!doc.lender_signed_at && !!doc.borrower_signed_at
  const goalAmt  = project.goal_amount ?? 0

  const mensualite  = amount > 0 && months > 0 ? calcMensualite(amount, months, rate) : null
  const typeLabel   = DOC_TYPE_LABELS[doc.type] ?? doc.type
  const createdDate = new Date(doc.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const ownerName  = [ownerProfile.first_name, ownerProfile.last_name].filter(Boolean).join(' ') || 'Porteur de projet'
  const memberName = member ? [member.first_name, member.last_name].filter(Boolean).join(' ') : 'Contributeur'

  const showLegal = goalAmt > LEGAL_THRESHOLD && !legalDismissed

  return (
    <>
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link href="/documents" className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-3">
            <ArrowLeft size={15} />
            Retour aux documents
          </Link>
          <h1 className="font-serif text-3xl text-text">{typeLabel}</h1>
          <p className="text-muted text-sm mt-1">
            {memberName} → {ownerName}
            {amount > 0 && <> · <span className="font-medium text-text">{fmt(amount)} €</span></>}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Colonne principale ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Bannière juridique */}
          {showLegal && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5">
              <Scale size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">
                <p className="font-semibold text-amber-800 mb-0.5">Votre levée dépasse {fmt(LEGAL_THRESHOLD)} €</p>
                <p className="text-amber-700 leading-relaxed">
                  Pour les montants importants, une validation par un avocat partenaire spécialisé en droit des prêts
                  familiaux peut sécuriser votre démarche.
                </p>
                <Link href="/tarifs" className="mt-2 inline-block text-amber-800 font-semibold underline underline-offset-2 text-sm hover:text-amber-900 transition-colors">
                  Plan Avec un avocat — 249 € →
                </Link>
              </div>
              <button onClick={() => setLegalDismissed(true)} className="text-amber-400 hover:text-amber-600 shrink-0">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Aperçu du document */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted">
                <FileText size={15} />
                <span>Aperçu du contrat</span>
              </div>
              {!isSigned && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full font-medium">
                  Non signé
                </span>
              )}
            </div>

            {/* Paper document */}
            <div className="p-6 sm:p-8 bg-gray-50/50">
              <div
                className="relative bg-white shadow-md rounded-lg mx-auto"
                style={{
                  maxWidth: 640,
                  fontFamily: 'Georgia, serif',
                  padding: '48px 52px',
                  lineHeight: 1.75,
                  color: '#1A1A1A',
                  fontSize: 14,
                }}
              >
                {/* Watermark */}
                {!isSigned && (
                  <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                    style={{ zIndex: 10 }}
                  >
                    <span
                      style={{
                        fontSize: 80,
                        fontWeight: 800,
                        color: 'rgba(0,0,0,0.04)',
                        transform: 'rotate(-35deg)',
                        letterSpacing: 8,
                        userSelect: 'none',
                      }}
                    >
                      APERÇU
                    </span>
                  </div>
                )}

                {/* Header doc */}
                <div className="text-center mb-8">
                  <p style={{ fontSize: 11, letterSpacing: 3, color: '#6B7280', marginBottom: 8 }}>
                    DOCUMENT CONFIDENTIEL
                  </p>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1C3B2E', marginBottom: 4 }}>
                    {typeLabel.toUpperCase()}
                  </h2>
                  <p style={{ fontSize: 12, color: '#6B7280' }}>
                    Établi le {createdDate}
                  </p>
                </div>

                <hr style={{ borderColor: '#E5E7EB', marginBottom: 28 }} />

                {/* Parties */}
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: '#1C3B2E' }}>
                    ENTRE LES SOUSSIGNÉS
                  </p>
                  <p style={{ marginBottom: 8 }}>
                    <span style={{ fontWeight: 600 }}>{memberName}</span>,
                    ci-après désigné(e) le <em>« Prêteur »</em>
                  </p>
                  <p style={{ marginBottom: 8, textAlign: 'center', color: '#9CA3AF' }}>—</p>
                  <p>
                    <span style={{ fontWeight: 600 }}>{ownerName}</span>,
                    porteur du projet <em>« {project.name} »</em>,
                    ci-après désigné(e) l'<em>« Emprunteur »</em>
                  </p>
                </div>

                <p style={{ marginBottom: 24, fontStyle: 'italic', color: '#6B7280', fontSize: 13 }}>
                  Il a été convenu ce qui suit :
                </p>

                {/* Article 1 */}
                <Article title="Article 1 — Objet du prêt">
                  Le Prêteur, <Hl>{memberName}</Hl>, consent à prêter à l&apos;Emprunteur,{' '}
                  <Hl>{ownerName}</Hl>, la somme de{' '}
                  {amount > 0 ? (
                    <>
                      <Hl>{amountInWords(amount)}</Hl>{' '}
                      (<Hl>{fmt(amount)} €</Hl>)
                    </>
                  ) : (
                    <Hl>[MONTANT À PRÉCISER]</Hl>
                  )}{' '}
                  destinée au financement du projet <em>« {project.name} »</em>.
                </Article>

                {/* Article 2 */}
                <Article title="Article 2 — Durée et remboursement">
                  {months > 0 ? (
                    <>
                      Le prêt est consenti pour une durée de <Hl>{months} mois</Hl>.{' '}
                      {mensualite != null && (
                        <>
                          L&apos;Emprunteur s&apos;engage à rembourser une mensualité de{' '}
                          <Hl>{fmt(Math.round(mensualite))} €</Hl>.
                        </>
                      )}
                    </>
                  ) : (
                    <>La durée de remboursement sera définie d&apos;un commun accord entre les parties.</>
                  )}
                </Article>

                {/* Article 3 */}
                <Article title="Article 3 — Taux d'intérêt">
                  {rate === 0 ? (
                    <>
                      Le présent prêt est consenti à titre <Hl>gratuit, sans intérêts</Hl>, conformément
                      à l&apos;article 1905 du Code civil.
                    </>
                  ) : (
                    <>
                      Le présent prêt est consenti au taux annuel de <Hl>{rate} %</Hl>, conformément
                      à l&apos;article 1905 du Code civil.
                    </>
                  )}
                </Article>

                {/* Signatures placeholder */}
                <div style={{ marginTop: 40, display: 'flex', gap: 40 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 12, marginBottom: 4, color: '#6B7280' }}>LE PRÊTEUR</p>
                    <p style={{ fontSize: 13, marginBottom: 32 }}>{memberName}</p>
                    {doc.lender_signed_at ? (
                      <p style={{ fontSize: 11, color: '#2D6A4F', fontWeight: 600 }}>
                        ✓ Signé le {new Date(doc.lender_signed_at).toLocaleDateString('fr-FR')}
                      </p>
                    ) : (
                      <div style={{ borderBottom: '1px solid #D1D5DB', width: 120, height: 24 }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 12, marginBottom: 4, color: '#6B7280' }}>L&apos;EMPRUNTEUR</p>
                    <p style={{ fontSize: 13, marginBottom: 32 }}>{ownerName}</p>
                    {doc.borrower_signed_at ? (
                      <p style={{ fontSize: 11, color: '#2D6A4F', fontWeight: 600 }}>
                        ✓ Signé le {new Date(doc.borrower_signed_at).toLocaleDateString('fr-FR')}
                      </p>
                    ) : (
                      <div style={{ borderBottom: '1px solid #D1D5DB', width: 120, height: 24 }} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sidebar droite ── */}
        <div className="space-y-4">

          {/* Détails */}
          <SideCard title="Détails du document">
            <DetailRow icon={<FileText size={14} />} label="Type">
              {typeLabel}
            </DetailRow>
            <DetailRow icon={<Users size={14} />} label="Parties">
              {memberName} → {ownerName}
            </DetailRow>
            {amount > 0 && (
              <DetailRow icon={<Euro size={14} />} label="Montant">
                {fmt(amount)} €{months > 0 && ` — ${months} mois`}{rate > 0 && ` — ${rate}%`}
              </DetailRow>
            )}
            <DetailRow icon={<Calendar size={14} />} label="Déclaration fiscale">
              <span className="text-primary font-medium">Cerfa 2062 à déclarer ✓</span>
            </DetailRow>
          </SideCard>

          {/* Signatures */}
          <SideCard title="Signatures">
            <div className="space-y-3">
              <SignRow
                name={memberName}
                role="Prêteur"
                signedAt={doc.lender_signed_at}
              />
              <SignRow
                name={ownerName}
                role="Emprunteur"
                signedAt={doc.borrower_signed_at}
              />
            </div>
          </SideCard>

          {/* CTA Signer */}
          <div className="bg-[#1C3B2E] rounded-2xl p-5 text-white">
            <p className="font-semibold text-lg mb-1">Prêt à signer ?</p>
            <p className="text-white/60 text-sm mb-1">
              Signature électronique sécurisée via Yousign (eIDAS)
            </p>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-white font-bold text-lg">19 €</span>
              <span className="text-white/50 text-sm">/ mois</span>
            </div>
            <p className="text-white/40 text-xs mb-4">Plan En Famille · contrats illimités inclus</p>
            <Link
              href="/tarifs"
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-dark transition-colors"
            >
              <PenLine size={15} />
              Activer En Famille — 19 €/mois
            </Link>
            <p className="text-center mt-2">
              <Link href="/tarifs" className="text-xs text-white/40 hover:text-white/60 transition-colors">
                Voir tous les plans →
              </Link>
            </p>
          </div>

          {/* Réassurance */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-primary" />
              <p className="text-sm font-semibold text-text">Protection juridique</p>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Nos contrats sont conformes au droit français et répondent aux exigences de l&apos;article 1905
              du Code civil. Une validation par avocat est disponible via le plan{' '}
              <Link href="/tarifs" className="text-primary font-medium hover:underline">Avec un avocat — 249 €</Link>.
            </p>
            <div className="flex items-center gap-1.5 mt-3 text-xs text-muted">
              <Lock size={12} />
              <span>Documents chiffrés et hébergés en France</span>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

/* ── Sub-components ─────────────────────────────────────────────────── */

function Article({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: '#1C3B2E' }}>{title}</p>
      <p style={{ fontSize: 13.5, lineHeight: 1.8, color: '#374151' }}>{children}</p>
    </div>
  )
}

function Hl({ children }: { children: React.ReactNode }) {
  return (
    <strong style={{ color: '#2D6A4F', fontWeight: 700 }}>{children}</strong>
  )
}

function SideCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="font-semibold text-text text-sm mb-4">{title}</p>
      {children}
    </div>
  )
}

function DetailRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-muted shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm text-text mt-0.5">{children}</p>
      </div>
    </div>
  )
}

function SignRow({ name, role, signedAt }: { name: string; role: string; signedAt: string | null }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-text">{name}</p>
        <p className="text-xs text-muted">{role}</p>
      </div>
      {signedAt ? (
        <div className="text-right">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            Signé ✓
          </span>
          <p className="text-xs text-muted mt-1">
            {new Date(signedAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
      ) : (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
          En attente
        </span>
      )}
    </div>
  )
}
