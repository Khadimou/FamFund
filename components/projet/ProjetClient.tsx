'use client'

import { useState, useEffect, useCallback } from 'react'
import { Save, AlertTriangle, Check, MapPin, Tag } from 'lucide-react'
import { updateProject, type ProjectUpdatePayload } from '@/app/actions/projet'

/* ── Constants ────────────────────────────────────────────────────────── */
const LEGAL_THRESHOLD = 15_000

const CATEGORIES = [
  'Commerce alimentaire', 'Restaurant / Bar', 'Artisanat',
  'Commerce de détail', 'Services', 'Immobilier', 'Agriculture',
  'Numérique / Tech', 'Santé / Bien-être', 'Éducation / Formation',
  'Culture / Art', 'Autre',
]

const fmt = (n: number) =>
  n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

/* ── Types ────────────────────────────────────────────────────────────── */
// Supabase returns snake_case — we accept the raw row
interface RawProject {
  id: string
  name: string | null
  category: string | null
  location: string | null
  description: string | null
  goal_amount: number | null
  minimum_amount: number | null
  duration_months: number | null
  interest_rate: number | null
  start_date: string | null
}

interface Fields {
  name:           string
  category:       string
  location:       string
  description:    string
  goalAmount:     string
  minimumAmount:  string
  durationMonths: string
  interestRate:   string
  startDate:      string
}

interface Props {
  project:      RawProject
  membersCount: number
}

/* ── Helpers ──────────────────────────────────────────────────────────── */
function toFields(p: RawProject): Fields {
  return {
    name:           p.name            ?? '',
    category:       p.category        ?? '',
    location:       p.location        ?? '',
    description:    p.description     ?? '',
    goalAmount:     p.goal_amount     != null ? String(p.goal_amount)     : '',
    minimumAmount:  p.minimum_amount  != null ? String(p.minimum_amount)  : '',
    durationMonths: p.duration_months != null ? String(p.duration_months) : '',
    interestRate:   p.interest_rate   != null ? String(p.interest_rate)   : '',
    startDate:      p.start_date      ?? '',
  }
}

function isDirty(a: Fields, b: Fields): boolean {
  return (Object.keys(a) as (keyof Fields)[]).some(k => a[k] !== b[k])
}

/* ══════════════════════════════════════════════════════════════════════ */
export default function ProjetClient({ project, membersCount }: Props) {
  const initial              = toFields(project)
  const [fields, setFields]  = useState<Fields>(initial)
  const [saved,  setSaved]   = useState<Fields>(initial)
  const [loading, setLoading] = useState(false)
  const [toast,   setToast]   = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const dirty       = isDirty(fields, saved)
  const goalNum     = parseFloat(fields.goalAmount)     || 0
  const minNum      = parseFloat(fields.minimumAmount)  || 0
  const durationNum = parseFloat(fields.durationMonths) || 0
  const rateNum     = parseFloat(fields.interestRate)   || 0
  const showLegal   = goalNum > LEGAL_THRESHOLD

  /* Completeness */
  const criteria = [
    { label: 'Nom du projet',           ok: fields.name.trim().length > 0         },
    { label: 'Description',             ok: fields.description.trim().length > 0  },
    { label: 'Objectif de financement', ok: goalNum > 0                           },
    { label: 'Date de démarrage',       ok: fields.startDate.trim().length > 0    },
    { label: 'Membres invités',         ok: membersCount > 0                      },
  ]
  const completePct = Math.round((criteria.filter(c => c.ok).length / criteria.length) * 100)

  /* Toast auto-dismiss */
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  const set = useCallback(
    (key: keyof Fields) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setFields(prev => ({ ...prev, [key]: e.target.value })),
    [],
  )

  async function handleSave() {
    if (!dirty) return
    setLoading(true)

    const payload: ProjectUpdatePayload = {
      name:           fields.name,
      category:       fields.category,
      location:       fields.location,
      description:    fields.description,
      goalAmount:     goalNum     || null,
      minimumAmount:  minNum      || null,
      durationMonths: durationNum || null,
      interestRate:   rateNum     || null,
      startDate:      fields.startDate || null,
    }

    const result = await updateProject(project.id, payload)
    setLoading(false)

    if (result.error) {
      setToast({ type: 'error', msg: result.error })
    } else {
      setSaved({ ...fields })
      setToast({ type: 'success', msg: 'Projet sauvegardé avec succès.' })
    }
  }

  /* ── Render ── */
  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          toast.type === 'success'
            ? 'bg-primary text-white'
            : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-text">{fields.name || 'Mon projet'}</h1>
          <p className="text-muted text-sm mt-1 flex items-center gap-1.5">
            {fields.location && (
              <>
                <MapPin size={13} className="shrink-0" />
                <span>{fields.location}</span>
              </>
            )}
            {fields.location && fields.category && <span className="mx-1">·</span>}
            {fields.category && (
              <>
                <Tag size={13} className="shrink-0" />
                <span>{fields.category}</span>
              </>
            )}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={!dirty || loading}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            dirty && !loading
              ? 'bg-primary text-white hover:bg-primary-dark shadow-sm'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Save size={15} />
          {loading ? 'Sauvegarde…' : 'Sauvegarder'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Colonne principale ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Présentation */}
          <Section title="Présentation du projet">
            <div className="space-y-4">
              <Field label="Nom du projet" required>
                <input
                  type="text"
                  value={fields.name}
                  onChange={set('name')}
                  placeholder="Boulangerie Laurent & Fils"
                  className={inp}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Catégorie">
                  <select value={fields.category} onChange={set('category')} className={inp}>
                    <option value="">Sélectionner…</option>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Localisation">
                  <input
                    type="text"
                    value={fields.location}
                    onChange={set('location')}
                    placeholder="Paris 11ème"
                    className={inp}
                  />
                </Field>
              </div>
              <Field label="Description">
                <textarea
                  value={fields.description}
                  onChange={set('description')}
                  rows={4}
                  placeholder="Décrivez votre projet en quelques mots…"
                  className={`${inp} resize-none`}
                />
              </Field>
            </div>
          </Section>

          {/* Paramètres financiers */}
          <Section title="Paramètres financiers">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Objectif de collecte" unit="€">
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={fields.goalAmount}
                  onChange={set('goalAmount')}
                  placeholder="50 000"
                  className={inpUnit}
                />
              </Field>
              <Field label="Objectif minimum" unit="€">
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={fields.minimumAmount}
                  onChange={set('minimumAmount')}
                  placeholder="30 000"
                  className={inpUnit}
                />
              </Field>
              <Field label="Durée de remboursement" unit="mois">
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={fields.durationMonths}
                  onChange={set('durationMonths')}
                  placeholder="36"
                  className={inpUnit}
                />
              </Field>
              <Field label="Taux d'intérêt" unit="%">
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={fields.interestRate}
                  onChange={set('interestRate')}
                  placeholder="0"
                  className={inpUnit}
                />
              </Field>
            </div>

            {/* Bannière juridique */}
            {showLegal && (
              <div className="mt-4 flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">
                <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-500" />
                <span>
                  <span className="font-semibold">Plan Juridique recommandé</span> — Votre collecte dépasse{' '}
                  {fmt(LEGAL_THRESHOLD)} €. La validation par un avocat partenaire est recommandée pour sécuriser
                  votre dossier.
                </span>
              </div>
            )}
          </Section>

          {/* Calendrier */}
          <Section title="Calendrier">
            <Field label="Date de démarrage du projet">
              <input
                type="date"
                value={fields.startDate}
                onChange={set('startDate')}
                className={inp}
              />
            </Field>
          </Section>

        </div>

        {/* ── Sidebar droite ── */}
        <div className="space-y-5">

          {/* Complétude */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-text mb-4">Complétude du dossier</h3>

            {/* Barre */}
            <div className="mb-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted">Progression</span>
                <span className={`text-sm font-bold ${completePct === 100 ? 'text-primary' : 'text-text'}`}>
                  {completePct}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${completePct}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-muted mb-4">{completePct}% complété</p>

            {/* Critères */}
            <ul className="space-y-2.5">
              {criteria.map(c => (
                <li key={c.label} className="flex items-center gap-2.5 text-sm">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    c.ok ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-300'
                  }`}>
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className={c.ok ? 'text-text' : 'text-muted'}>{c.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Résumé financier */}
          <div className="bg-[#1C3B2E] rounded-2xl p-5 text-white space-y-4">
            <h3 className="font-semibold text-white/80 text-sm uppercase tracking-wide">Résumé</h3>

            <div className="space-y-3">
              <SummaryRow icon="€" label="Objectif">
                {goalNum > 0 ? `${fmt(goalNum)} €` : '—'}
              </SummaryRow>
              <SummaryRow icon="📅" label="Durée">
                {durationNum > 0 ? `${durationNum} mois` : '—'}
              </SummaryRow>
              <SummaryRow icon="@" label="Taux">
                {fields.interestRate !== '' ? `${rateNum} %` : '—'}
              </SummaryRow>
            </div>

            {goalNum > 0 && minNum > 0 && (
              <div className="pt-3 border-t border-white/10">
                <p className="text-xs text-white/50">
                  Objectif minimum : <span className="text-white/80 font-medium">{fmt(minNum)} €</span>
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}

/* ── Sub-components ─────────────────────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="font-semibold text-text mb-5">{title}</h2>
      {children}
    </div>
  )
}

function Field({
  label, required, unit, children,
}: {
  label: string; required?: boolean; unit?: string; children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-text">
        {label}
        {required && <span className="text-accent ml-0.5">*</span>}
        {unit && <span className="text-muted font-normal text-xs ml-1">({unit})</span>}
      </label>
      {children}
    </div>
  )
}

function SummaryRow({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-white/60">
        <span>{icon}</span>
        {label}
      </span>
      <span className="text-sm font-semibold text-white">{children}</span>
    </div>
  )
}

/* ── Styles ─────────────────────────────────────────────────────────── */
const inp     = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition'
const inpUnit = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition'
