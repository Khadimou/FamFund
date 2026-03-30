'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createProject } from '@/app/actions/onboarding'

const CATEGORIES = [
  'Commerce alimentaire',
  'Immobilier',
  'Études',
  "Création d'entreprise",
  'Autre',
]

const DURATIONS = [12, 24, 36, 48, 60]

interface Fields {
  firstName: string
  lastName: string
  projectName: string
  category: string
  location: string
  description: string
  goalAmount: string
  minimumAmount: string
  durationMonths: string
  interestRate: string
}

const INITIAL: Fields = {
  firstName: '',
  lastName: '',
  projectName: '',
  category: '',
  location: '',
  description: '',
  goalAmount: '',
  minimumAmount: '',
  durationMonths: '',
  interestRate: '0',
}

export default function OnboardingForm() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [fields, setFields] = useState<Fields>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(key: keyof Fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setFields((prev) => ({ ...prev, [key]: e.target.value }))
  }

  function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    setStep(2)
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await createProject({
      firstName: fields.firstName,
      lastName: fields.lastName,
      projectName: fields.projectName,
      category: fields.category,
      location: fields.location,
      description: fields.description,
      goalAmount: parseFloat(fields.goalAmount),
      minimumAmount: parseFloat(fields.minimumAmount),
      durationMonths: fields.durationMonths ? parseInt(fields.durationMonths) : null,
      interestRate: parseFloat(fields.interestRate) || 0,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="w-full max-w-xl">
      {/* En-tête */}
      <div className="text-center mb-8">
        <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-2">
          FamilyFund
        </p>
        <h1 className="font-serif text-3xl text-[#1C3B2E]">Créons votre projet</h1>
        <p className="text-muted text-sm mt-2">Quelques informations pour bien démarrer</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-3 mb-8">
        <StepDot index={1} current={step} label="Votre projet" />
        <div className="flex-1 h-px bg-gray-200" />
        <StepDot index={2} current={step} label="Paramètres financiers" />
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        {step === 1 ? (
          <form onSubmit={handleStep1} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Prénom" required>
                <input
                  type="text"
                  value={fields.firstName}
                  onChange={set('firstName')}
                  placeholder="Marie"
                  required
                  className={inputCls}
                />
              </Field>
              <Field label="Nom" required>
                <input
                  type="text"
                  value={fields.lastName}
                  onChange={set('lastName')}
                  placeholder="Laurent"
                  required
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Nom du projet" required>
              <input
                type="text"
                value={fields.projectName}
                onChange={set('projectName')}
                placeholder="Boulangerie Laurent & Fils"
                required
                className={inputCls}
              />
            </Field>

            <Field label="Catégorie" required>
              <select
                value={fields.category}
                onChange={set('category')}
                required
                className={inputCls}
              >
                <option value="" disabled>
                  Sélectionnez une catégorie
                </option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Localisation">
              <input
                type="text"
                value={fields.location}
                onChange={set('location')}
                placeholder="Paris 11ème"
                className={inputCls}
              />
            </Field>

            <Field label="Description">
              <textarea
                value={fields.description}
                onChange={set('description')}
                placeholder="Décrivez votre projet en quelques lignes…"
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </Field>

            <button type="submit" className={btnPrimary}>
              Continuer →
            </button>
          </form>
        ) : (
          <form onSubmit={handleStep2} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Objectif de collecte (€)" required>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={fields.goalAmount}
                  onChange={set('goalAmount')}
                  placeholder="30 000"
                  required
                  className={inputCls}
                />
              </Field>
              <Field label="Objectif minimum (€)" required>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={fields.minimumAmount}
                  onChange={set('minimumAmount')}
                  placeholder="15 000"
                  required
                  className={inputCls}
                />
              </Field>
            </div>

            <Field label="Durée de remboursement">
              <select
                value={fields.durationMonths}
                onChange={set('durationMonths')}
                className={inputCls}
              >
                <option value="">Non applicable</option>
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d} mois
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Taux d'intérêt (%)">
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={fields.interestRate}
                onChange={set('interestRate')}
                placeholder="0"
                className={inputCls}
              />
            </Field>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
                className={btnSecondary}
              >
                ← Retour
              </button>
              <button type="submit" disabled={loading} className={`${btnPrimary} flex-1`}>
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Création…' : 'Créer mon projet'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

/* ── Sous-composants ── */

function StepDot({
  index,
  current,
  label,
}: {
  index: number
  current: number
  label: string
}) {
  const done = index < current
  const active = index === current

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
          done
            ? 'bg-primary text-white'
            : active
              ? 'bg-primary text-white ring-4 ring-primary/20'
              : 'bg-gray-100 text-muted'
        }`}
      >
        {done ? '✓' : index}
      </div>
      <span className={`text-xs whitespace-nowrap ${active ? 'text-primary font-medium' : 'text-muted'}`}>
        {label}
      </span>
    </div>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-text">
        {label}
        {required && <span className="text-accent ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

/* ── Styles partagés ── */

const inputCls =
  'w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-text text-sm ' +
  'placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition'

const btnPrimary =
  'w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white ' +
  'font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed'

const btnSecondary =
  'flex items-center justify-center px-5 py-3 rounded-xl border border-gray-200 text-text ' +
  'font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
