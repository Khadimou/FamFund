'use client'

import { useState, useCallback } from 'react'
import { Plus, Trash2, Printer, Sparkles, Loader2, FileText } from 'lucide-react'

/* ── Types ── */
type ContribType   = 'pret' | 'don' | 'investissement'
type ContribStatus = 'signe' | 'en_attente'

interface Contributor {
  id:        string
  firstName: string
  lastName:  string
  type:      ContribType
  amount:    string
  status:    ContribStatus
}

interface Props {
  ownerFirstName:  string
  ownerLastName:   string
  projectName:     string
  goalAmount:      string
  initialMembers:  Contributor[]
}

/* ── Constants ── */
const TYPE_LABELS: Record<ContribType, string>     = { pret: 'Prêt', don: 'Don', investissement: 'Investissement' }
const STATUS_LABELS: Record<ContribStatus, string> = { signe: 'Signé', en_attente: 'En attente' }

const fmt     = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtInt  = (n: number) => n.toLocaleString('fr-FR')
const today   = () => new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })

/* ── Unique ID helper (stable per session) ── */
let _uid = 0
function uid() { return `c_${++_uid}` }

/* ══════════════════════════════════════════════════════════════════════ */
export default function LettreSyntheseClient({
  ownerFirstName, ownerLastName, projectName, goalAmount, initialMembers,
}: Props) {
  const [firstName,    setFirstName]    = useState(ownerFirstName)
  const [lastName,     setLastName]     = useState(ownerLastName)
  const [projName,     setProjName]     = useState(projectName)
  const [goal,         setGoal]         = useState(goalAmount)
  const [contributors, setContributors] = useState<Contributor[]>(
    initialMembers.length > 0 ? initialMembers : [],
  )
  const [generated,    setGenerated]    = useState(false)
  const [loading,      setLoading]      = useState(false)

  /* ── Contributor mutations ── */
  const addContributor = useCallback(() => {
    setContributors(prev => [...prev, {
      id: uid(), firstName: '', lastName: '', type: 'pret', amount: '', status: 'en_attente',
    }])
  }, [])

  const removeContributor = useCallback((id: string) => {
    setContributors(prev => prev.filter(c => c.id !== id))
  }, [])

  const updateContributor = useCallback(<K extends keyof Contributor>(id: string, key: K, value: Contributor[K]) => {
    setContributors(prev => prev.map(c => c.id === id ? { ...c, [key]: value } : c))
  }, [])

  /* ── Generate ── */
  function handleGenerate() {
    setLoading(true)
    setTimeout(() => { setLoading(false); setGenerated(true) }, 750)
  }

  /* ── Print ── */
  function handlePrint() {
    const dateStr  = today()
    const goalNum  = parseFloat(goal) || 0
    const { totalEngaged, totalSigned, signedCount, byType, remaining, pct } = computeStatsStatic(goalNum, contributors)

    const rows = contributors.map(c => {
      const amt    = parseFloat(c.amount) || 0
      const isSigned = c.status === 'signe'
      return `
        <tr>
          <td>${c.firstName} ${c.lastName}</td>
          <td>${TYPE_LABELS[c.type]}</td>
          <td>${fmtInt(amt)} €</td>
          <td class="${isSigned ? 'signed' : 'pending'}">${isSigned ? 'Signé ✓' : 'En attente'}</td>
        </tr>`
    }).join('')

    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html lang="fr"><head>
      <meta charset="UTF-8"/>
      <title>Lettre de synthèse — ${projName}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Georgia, serif; color: #1A1A1A; font-size: 13px; line-height: 1.7; }
        .page { max-width: 720px; margin: 0 auto; padding: 56px 64px; }
        .header { text-align: center; margin-bottom: 32px; }
        .logo { font-size: 20px; font-weight: 700; color: #2D6A4F; letter-spacing: 1px; margin-bottom: 8px; }
        .title { font-size: 14px; font-weight: 700; color: #1C3B2E; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .date { font-size: 12px; color: #6B7280; margin-bottom: 4px; }
        .source { font-size: 11px; color: #9CA3AF; }
        .divider { height: 3px; background: #2D6A4F; border-radius: 2px; margin: 20px 0; }
        h2 { font-size: 13px; font-weight: 700; color: #2D6A4F; text-transform: uppercase; letter-spacing: 0.5px; margin: 28px 0 12px; padding-bottom: 6px; border-bottom: 1px solid #E5E7EB; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .info-item label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #9CA3AF; display: block; margin-bottom: 2px; }
        .info-item p { font-size: 13px; font-weight: 600; color: #1A1A1A; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 4px; }
        th { text-align: left; padding: 8px 10px; border-bottom: 2px solid #E5E7EB; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #6B7280; }
        td { padding: 9px 10px; border-bottom: 1px solid #F3F4F6; }
        td.signed { background: #1C3B2E; color: #fff; font-weight: 600; border-radius: 4px; }
        td.pending { color: #6B7280; }
        tr.total td { font-weight: 700; border-top: 2px solid #E5E7EB; padding-top: 12px; }
        tr.total td.orange { color: #EA580C; }
        .summary { background: #F9FAFB; border-radius: 8px; padding: 16px 20px; font-size: 12.5px; line-height: 1.8; color: #374151; margin-top: 4px; }
        .legal { font-size: 11px; color: #9CA3AF; font-style: italic; line-height: 1.6; margin-top: 4px; }
        .footer { text-align: center; font-size: 10px; color: #D1D5DB; margin-top: 40px; padding-top: 16px; border-top: 1px solid #F3F4F6; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
    </head><body><div class="page">
      <div class="header">
        <div class="logo">✦ FamilyFund</div>
        <div class="title">Lettre de synthèse des engagements<br/>de financement participatif familial</div>
        <div class="date">${dateStr}</div>
        <div class="source">Document généré via FamilyFund — familyfund.fr</div>
      </div>
      <div class="divider"></div>

      <h2>1. Identification du porteur de projet</h2>
      <div class="info-grid">
        <div class="info-item"><label>Nom complet</label><p>${firstName} ${lastName}</p></div>
        <div class="info-item"><label>Nom du projet</label><p>${projName}</p></div>
        <div class="info-item"><label>Montant total visé</label><p>${fmtInt(goalNum)} €</p></div>
      </div>

      <h2>2. Tableau des engagements</h2>
      <table>
        <thead><tr><th>Contributeur</th><th>Type</th><th>Montant</th><th>Statut</th></tr></thead>
        <tbody>
          ${rows}
          <tr class="total">
            <td colspan="2">Total engagé</td>
            <td class="orange">${fmtInt(totalEngaged)} €</td>
            <td class="orange">${pct}% du montant visé</td>
          </tr>
        </tbody>
      </table>

      <h2>3. Synthèse exécutive</h2>
      <div class="summary">${buildSummary(firstName, lastName, projName, goalNum, contributors, { totalEngaged, totalSigned, signedCount, byType, remaining, pct })}</div>

      <h2>4. Mentions légales</h2>
      <div class="legal">Ce document est établi à titre informatif sur la base des déclarations d'intention recueillies par le porteur de projet. Les engagements de prêt entre particuliers sont soumis à déclaration fiscale (formulaire 2062) dès lors que le montant dépasse 760 €. Ce document ne constitue pas un acte juridique opposable. FamilyFund — familyfund.fr</div>

      <div class="footer">Document confidentiel — généré le ${dateStr} — FamilyFund</div>
    </div>
    <script>window.onload = () => window.print()<\/script>
    </body></html>`)
    win.document.close()
  }

  /* ── Render ── */
  const stats = computeStatsStatic(parseFloat(goal) || 0, contributors)

  return (
    <>
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-text">Lettre de synthèse</h1>
          <p className="text-muted text-sm mt-1">Générez un document professionnel pour votre banque ou BPI France</p>
        </div>
        <div className="flex items-center gap-3">
          {generated && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-text font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              <Printer size={15} />
              Imprimer / PDF
            </button>
          )}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-70"
          >
            {loading
              ? <><Loader2 size={15} className="animate-spin" /> Génération…</>
              : <><Sparkles size={15} /> Générer la lettre</>
            }
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* ══ COLONNE GAUCHE — Formulaire ══ */}
        <div className="space-y-5">

          {/* Porteur */}
          <FormCard title="Porteur de projet">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Prénom">
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jean-Pierre" className={inp} />
              </Field>
              <Field label="Nom">
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Laurent" className={inp} />
              </Field>
            </div>
            <Field label="Nom du projet">
              <input type="text" value={projName} onChange={e => setProjName(e.target.value)} placeholder="Boulangerie Laurent & Fils" className={inp} />
            </Field>
            <Field label="Montant total visé (€)">
              <input type="number" min={0} step={1000} value={goal} onChange={e => setGoal(e.target.value)} placeholder="50 000" className={inp} />
            </Field>
          </FormCard>

          {/* Contributeurs */}
          <FormCard
            title="Contributeurs"
            aside={
              <button onClick={addContributor} className="flex items-center gap-1 text-sm text-primary font-semibold hover:underline">
                <Plus size={14} /> Ajouter
              </button>
            }
          >
            {contributors.length === 0 ? (
              <p className="text-sm text-muted text-center py-4">
                Aucun contributeur — cliquez « Ajouter » pour en renseigner un.
              </p>
            ) : (
              <div className="space-y-3">
                {contributors.map(c => (
                  <div key={c.id} className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Prénom"
                        value={c.firstName}
                        onChange={e => updateContributor(c.id, 'firstName', e.target.value)}
                        className={inpSm}
                      />
                      <input
                        type="text"
                        placeholder="Nom"
                        value={c.lastName}
                        onChange={e => updateContributor(c.id, 'lastName', e.target.value)}
                        className={inpSm}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={c.type}
                        onChange={e => updateContributor(c.id, 'type', e.target.value as ContribType)}
                        className={inpSm}
                      >
                        <option value="pret">Prêt</option>
                        <option value="don">Don</option>
                        <option value="investissement">Investissement</option>
                      </select>
                      <input
                        type="number"
                        min={0}
                        step={500}
                        placeholder="Montant"
                        value={c.amount}
                        onChange={e => updateContributor(c.id, 'amount', e.target.value)}
                        className={inpSm}
                      />
                      <select
                        value={c.status}
                        onChange={e => updateContributor(c.id, 'status', e.target.value as ContribStatus)}
                        className={inpSm}
                      >
                        <option value="signe">Signé</option>
                        <option value="en_attente">En attente</option>
                      </select>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => removeContributor(c.id)}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={12} /> Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </FormCard>
        </div>

        {/* ══ COLONNE DROITE — Aperçu ══ */}
        <div className="lg:sticky lg:top-6">
          {!generated ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center py-32 text-center px-8">
              <FileText size={40} className="text-gray-300 mb-4" />
              <p className="font-semibold text-muted mb-1">Aperçu du document</p>
              <p className="text-sm text-gray-400 max-w-xs">
                Renseignez les données et cliquez « Générer la lettre »
              </p>
            </div>
          ) : (
            <DocumentPreview
              firstName={firstName}
              lastName={lastName}
              projName={projName}
              goal={parseFloat(goal) || 0}
              contributors={contributors}
              stats={stats}
            />
          )}
        </div>
      </div>
    </>
  )
}

/* ── Document Preview ─────────────────────────────────────────────── */
function DocumentPreview({
  firstName, lastName, projName, goal, contributors, stats,
}: {
  firstName: string; lastName: string; projName: string; goal: number
  contributors: Contributor[]
  stats: ReturnType<typeof computeStatsStatic>
}) {
  const dateStr = today()
  const { totalEngaged, signedCount, byType, remaining, pct } = stats

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-y-auto"
      style={{ maxHeight: '85vh', fontFamily: 'Georgia, serif', fontSize: 13 }}
    >
      {/* Paper content */}
      <div className="p-8 space-y-6" style={{ color: '#1A1A1A', lineHeight: 1.75 }}>

        {/* Header */}
        <div className="text-center space-y-1">
          <p style={{ fontSize: 18, fontWeight: 700, color: '#2D6A4F', letterSpacing: 1 }}>✦ FamilyFund</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#1C3B2E', textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: 1.4 }}>
            Lettre de synthèse des engagements<br />de financement participatif familial
          </p>
          <p style={{ fontSize: 11, color: '#6B7280' }}>{dateStr}</p>
          <p style={{ fontSize: 10, color: '#9CA3AF' }}>Document généré via FamilyFund — familyfund.fr</p>
        </div>
        <div style={{ height: 3, background: '#2D6A4F', borderRadius: 2 }} />

        {/* Section 1 */}
        <DocSection title="1. Identification du porteur de projet">
          <div className="grid grid-cols-2 gap-3">
            <InfoItem label="Nom complet"       value={`${firstName} ${lastName}`.trim() || '—'} />
            <InfoItem label="Nom du projet"     value={projName || '—'} />
            <InfoItem label="Montant total visé" value={goal > 0 ? `${fmtInt(goal)} €` : '—'} />
          </div>
        </DocSection>

        {/* Section 2 */}
        <DocSection title="2. Tableau des engagements">
          {contributors.length === 0 ? (
            <p style={{ fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' }}>Aucun contributeur renseigné.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                  {['Contributeur', 'Type', 'Montant', 'Statut'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280', fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contributors.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '8px 8px' }}>{c.firstName} {c.lastName}</td>
                    <td style={{ padding: '8px 8px', color: '#6B7280' }}>{TYPE_LABELS[c.type]}</td>
                    <td style={{ padding: '8px 8px', fontWeight: 600 }}>{fmtInt(parseFloat(c.amount) || 0)} €</td>
                    <td style={{ padding: '8px 8px' }}>
                      {c.status === 'signe' ? (
                        <span style={{ background: '#1C3B2E', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                          Signé ✓
                        </span>
                      ) : (
                        <span style={{ color: '#9CA3AF', fontSize: 11 }}>En attente</span>
                      )}
                    </td>
                  </tr>
                ))}
                {/* Total row */}
                <tr style={{ borderTop: '2px solid #E5E7EB' }}>
                  <td colSpan={2} style={{ padding: '10px 8px', fontWeight: 700, fontSize: 12 }}>Total engagé</td>
                  <td style={{ padding: '10px 8px', fontWeight: 700, color: '#EA580C', fontSize: 13 }}>{fmtInt(totalEngaged)} €</td>
                  <td style={{ padding: '10px 8px', fontWeight: 700, color: '#EA580C', fontSize: 11 }}>{pct}% du montant visé</td>
                </tr>
              </tbody>
            </table>
          )}
        </DocSection>

        {/* Section 3 */}
        <DocSection title="3. Synthèse exécutive">
          <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '14px 16px', fontSize: 12.5, lineHeight: 1.85, color: '#374151' }}>
            <p dangerouslySetInnerHTML={{ __html: buildSummary(firstName, lastName, projName, goal, contributors, stats) }} />
          </div>
        </DocSection>

        {/* Section 4 */}
        <DocSection title="4. Mentions légales">
          <p style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic', lineHeight: 1.7 }}>
            Ce document est établi à titre informatif sur la base des déclarations d&apos;intention recueillies
            par le porteur de projet. Les engagements de prêt entre particuliers sont soumis à déclaration
            fiscale (formulaire 2062) dès lors que le montant dépasse 760 €. Ce document ne constitue pas
            un acte juridique opposable. FamilyFund — familyfund.fr
          </p>
        </DocSection>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: 10, color: '#D1D5DB', paddingTop: 12, borderTop: '1px solid #F3F4F6' }}>
          Document confidentiel — généré le {dateStr} — FamilyFund
        </p>
      </div>
    </div>
  )
}

/* ── Shared stats computation (used both in preview and print) ── */
function computeStatsStatic(goal: number, contributors: Contributor[]) {
  const totalEngaged = contributors.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0)
  const totalSigned  = contributors.filter(c => c.status === 'signe').reduce((s, c) => s + (parseFloat(c.amount) || 0), 0)
  const signedCount  = contributors.filter(c => c.status === 'signe').length
  const remaining    = Math.max(0, goal - totalEngaged)
  const pct          = goal > 0 ? Math.round((totalEngaged / goal) * 100) : 0
  const byType = (['pret', 'don', 'investissement'] as ContribType[]).map(t => ({
    type:  t,
    label: TYPE_LABELS[t],
    total: contributors.filter(c => c.type === t).reduce((s, c) => s + (parseFloat(c.amount) || 0), 0),
    count: contributors.filter(c => c.type === t).length,
  })).filter(x => x.total > 0)
  return { totalEngaged, totalSigned, signedCount, byType, remaining, pct, goalNum: goal }
}

/* ── Narrative summary builder ── */
function buildSummary(
  firstName: string, lastName: string, projName: string, goal: number,
  contributors: Contributor[],
  stats: { totalEngaged: number; totalSigned: number; signedCount: number; byType: { label: string; total: number; count: number }[]; remaining: number; pct: number },
): string {
  const { totalEngaged, totalSigned, signedCount, byType, remaining, pct } = stats
  const dateStr    = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const ownerName  = `${firstName} ${lastName}`.trim() || 'le porteur de projet'
  const n          = contributors.length
  const pendingCount = n - signedCount
  const pctSigned  = n > 0 ? Math.round((signedCount / n) * 100) : 0
  const pctSgnAmt  = totalEngaged > 0 ? Math.round((totalSigned / totalEngaged) * 100) : 0

  if (n === 0) {
    return `À la date du ${dateStr}, aucun contributeur n'a encore été renseigné pour le projet <strong>${projName || '—'}</strong>.`
  }

  const typeBreakdown = byType.map(b =>
    `${b.count > 1 ? `${b.count} ` : ''}${b.label.toLowerCase()}${b.count > 1 ? 's' : ''} (${fmtInt(b.total)} €${goal > 0 ? ` — ${Math.round((b.total / goal) * 100)} % du montant visé` : ''})`
  ).join(', ')

  return [
    `À la date du <strong>${dateStr}</strong>, le projet <strong>« ${projName || '—'} »</strong> porté par <strong>${ownerName}</strong>`,
    ` a recueilli <strong>${n} engagement${n > 1 ? 's' : ''}</strong> de financement familial`,
    ` pour un montant total engagé de <strong>${fmtInt(totalEngaged)} €</strong>`,
    goal > 0 ? `, représentant <strong>${pct} % du montant visé</strong> (${fmtInt(goal)} €).` : '.',
    byType.length > 1 ? ` La répartition par type d'engagement est la suivante : ${typeBreakdown}.` : '',
    ` À ce jour, <strong>${signedCount} signature${signedCount > 1 ? 's' : ''} sur ${n}</strong>`,
    ` (${pctSigned} % des contributeurs, soit ${fmtInt(totalSigned)} € — ${pctSgnAmt} % des engagements en montant)`,
    ` ont été formellement recueillies.`,
    pendingCount > 0
      ? ` <strong>${pendingCount} engagement${pendingCount > 1 ? 's' : ''}</strong> (${fmtInt(Math.max(0, totalEngaged - totalSigned))} €) ${pendingCount > 1 ? 'sont' : 'est'} en cours de finalisation.`
      : '',
    remaining > 0
      ? ` Il reste <strong>${fmtInt(remaining)} €</strong> à mobiliser pour atteindre l'objectif de financement.`
      : goal > 0 && totalEngaged >= goal
      ? ` <strong>L'objectif de financement est atteint.</strong>`
      : '',
  ].join('')
}

/* ── Sub-components ─────────────────────────────────────────────────── */
function FormCard({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-text">{title}</h2>
        {aside}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-text">{label}</label>
      {children}
    </div>
  )
}

function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#2D6A4F', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #E5E7EB' }}>
        {title}
      </p>
      {children}
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9CA3AF', marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A' }}>{value}</p>
    </div>
  )
}

/* ── Styles ── */
const inp   = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition'
const inpSm = 'w-full px-2.5 py-2 rounded-lg border border-gray-200 bg-white text-sm text-text placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary transition'
