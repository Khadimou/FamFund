'use client'

import { useState, useRef, useCallback } from 'react'
import { Eye, EyeOff, Lock, Loader2, CheckCircle } from 'lucide-react'
import { saveProfilFinancier, type ProfilFinancierPayload } from '@/app/actions/profil-financier'

/* ── Constants ─────────────────────────────────────────────────────────── */
const MAX_SLIDER = 100_000
const STEP       = 500

const AVAILABILITIES = [
  { value: 'immediate',    label: 'Immédiatement'         },
  { value: '1_3_mois',    label: 'Dans 1 à 3 mois'       },
  { value: '3_6_mois',    label: 'Dans 3 à 6 mois'       },
  { value: 'plus_6_mois', label: 'Dans plus de 6 mois'   },
  { value: 'non_renseigne',label: 'Je ne sais pas encore' },
]

const PAYMENT_METHODS = [
  { value: 'one_shot',    label: 'En une seule fois'      },
  { value: 'versements',  label: 'En plusieurs versements' },
]

const PAYMENT_DURATIONS = [
  { value: '3_mois',       label: '3 mois'          },
  { value: '6_mois',       label: '6 mois'          },
  { value: '12_mois',      label: '12 mois'         },
  { value: 'plus_12_mois', label: 'Plus de 12 mois' },
]

const LOAN_REPAYMENT_DURATIONS = [
  { value: '12_mois',      label: '12 mois'          },
  { value: '24_mois',      label: '24 mois'          },
  { value: '36_mois',      label: '36 mois'          },
  { value: '48_mois_plus', label: '48 mois ou plus'  },
  { value: 'no_pref',      label: 'Pas de préférence' },
]

const REPAYMENT_FREQUENCIES = [
  { value: 'mensuelle',     label: 'Mensuelle'       },
  { value: 'trimestrielle', label: 'Trimestrielle'   },
  { value: 'in_fine',       label: 'In fine'         },
  { value: 'no_pref',       label: 'Pas de préférence' },
]

/* ── Types ─────────────────────────────────────────────────────────────── */
interface DefaultValues {
  minAmount:             number | null
  maxAmount:             number | null
  availability:          string
  paymentMethod:         string
  paymentDuration:       string
  loanRepaymentDuration: string
  repaymentFrequency:    string
  amountVisibility:      'private' | 'shared'
}

interface Props {
  memberId:       string
  ownerFirstName: string
  defaultValues:  DefaultValues
}

/* ── Helpers ────────────────────────────────────────────────────────────── */
const fmt = (n: number) => n.toLocaleString('fr-FR')

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function parseAmount(s: string): number {
  const n = parseFloat(s.replace(/\s/g, '').replace(',', '.'))
  return isNaN(n) ? 0 : clamp(n, 0, MAX_SLIDER)
}

/* ── Dual range slider ──────────────────────────────────────────────────── */
function DualSlider({
  min, max,
  onMinChange, onMaxChange,
}: {
  min: number; max: number
  onMinChange: (v: number) => void
  onMaxChange: (v: number) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)

  const minPct = (min / MAX_SLIDER) * 100
  const maxPct = (max / MAX_SLIDER) * 100

  function handleMin(e: React.ChangeEvent<HTMLInputElement>) {
    const v = clamp(Number(e.target.value), 0, max - STEP)
    onMinChange(v)
  }
  function handleMax(e: React.ChangeEvent<HTMLInputElement>) {
    const v = clamp(Number(e.target.value), min + STEP, MAX_SLIDER)
    onMaxChange(v)
  }

  return (
    <div className="relative h-5 flex items-center" ref={trackRef}>
      {/* Track background */}
      <div className="absolute inset-x-0 h-1.5 bg-gray-200 rounded-full" />
      {/* Active range */}
      <div
        className="absolute h-1.5 bg-primary rounded-full"
        style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
      />
      {/* Min thumb */}
      <input
        type="range"
        min={0}
        max={MAX_SLIDER}
        step={STEP}
        value={min}
        onChange={handleMin}
        className="range-input"
      />
      {/* Max thumb */}
      <input
        type="range"
        min={0}
        max={MAX_SLIDER}
        step={STEP}
        value={max}
        onChange={handleMax}
        className="range-input"
      />
    </div>
  )
}

/* ── Radio chip ─────────────────────────────────────────────────────────── */
function Chip({
  label, selected, onClick,
}: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
        selected
          ? 'bg-primary text-white border-primary'
          : 'bg-white text-muted border-gray-200 hover:border-primary hover:text-primary'
      }`}
    >
      {label}
    </button>
  )
}

/* ── Selectable card ────────────────────────────────────────────────────── */
function SelectCard({
  icon, title, subtitle, selected, onClick,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 w-full text-left p-4 rounded-xl border transition-colors ${
        selected
          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <span className={`mt-0.5 shrink-0 ${selected ? 'text-primary' : 'text-muted'}`}>
        {icon}
      </span>
      <div>
        <p className={`text-sm font-medium ${selected ? 'text-primary' : 'text-text'}`}>{title}</p>
        <p className="text-xs text-muted mt-0.5">{subtitle}</p>
      </div>
      <span className={`ml-auto mt-0.5 shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
        selected ? 'border-primary bg-primary' : 'border-gray-300'
      }`}>
        {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
      </span>
    </button>
  )
}

/* ══════════════════════════════════════════════════════════════════════════ */
export default function ProfilFinancierForm({ memberId, ownerFirstName, defaultValues }: Props) {
  const initMin = defaultValues.minAmount  ?? 5_000
  const initMax = defaultValues.maxAmount  ?? 20_000

  const [minAmt,    setMinAmt]    = useState(initMin)
  const [maxAmt,    setMaxAmt]    = useState(initMax)
  const [minInput,  setMinInput]  = useState(String(initMin))
  const [maxInput,  setMaxInput]  = useState(String(initMax))

  const [availability,          setAvailability]          = useState(defaultValues.availability)
  const [paymentMethod,         setPaymentMethod]         = useState(defaultValues.paymentMethod)
  const [paymentDuration,       setPaymentDuration]       = useState(defaultValues.paymentDuration)
  const [loanRepaymentDuration, setLoanRepaymentDuration] = useState(defaultValues.loanRepaymentDuration)
  const [repaymentFrequency,    setRepaymentFrequency]    = useState(defaultValues.repaymentFrequency)
  const [amountVisibility,      setAmountVisibility]      = useState<'private' | 'shared'>(defaultValues.amountVisibility)

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [done,    setDone]    = useState(false)

  /* Sync min input → slider */
  const commitMin = useCallback(() => {
    const v = clamp(parseAmount(minInput), 0, maxAmt - STEP)
    setMinAmt(v)
    setMinInput(String(v))
  }, [minInput, maxAmt])

  /* Sync max input → slider */
  const commitMax = useCallback(() => {
    const v = clamp(parseAmount(maxInput), minAmt + STEP, MAX_SLIDER)
    setMaxAmt(v)
    setMaxInput(String(v))
  }, [maxInput, minAmt])

  /* Slider → inputs */
  function handleSliderMin(v: number) {
    setMinAmt(v)
    setMinInput(String(v))
  }
  function handleSliderMax(v: number) {
    setMaxAmt(v)
    setMaxInput(String(v))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (minAmt <= 0 && maxAmt <= 0) {
      setError('Veuillez indiquer au moins un montant Min ou Max.')
      return
    }
    setLoading(true)
    setError('')

    const payload: ProfilFinancierPayload = {
      minAmount:             minAmt || null,
      maxAmount:             maxAmt || null,
      availability,
      paymentMethod,
      paymentDuration,
      loanRepaymentDuration,
      repaymentFrequency,
      amountVisibility,
    }

    const result = await saveProfilFinancier(memberId, payload)
    if (result.error) { setError(result.error); setLoading(false); return }
    setDone(true)
  }

  /* ── Success state ── */
  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <CheckCircle size={52} className="text-primary mx-auto mb-4" />
        <p className="font-serif text-2xl text-[#1C3B2E] mb-2">Merci !</p>
        <p className="text-muted text-sm max-w-xs mx-auto">
          Votre profil financier a bien été enregistré. {ownerFirstName} recevra une synthèse agrégée sans révéler vos détails.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* ── Section 1 : Fourchette ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-serif text-xl text-[#1C3B2E] mb-1">Ma capacité de contribution</h2>
        <p className="text-sm text-muted mb-6">Indiquez la fourchette que vous pourriez envisager</p>

        {/* Min / Max inputs */}
        <div className="flex items-end gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wide">Min</label>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={MAX_SLIDER}
                step={STEP}
                value={minInput}
                onChange={e => setMinInput(e.target.value)}
                onBlur={commitMin}
                className={inp}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm">€</span>
            </div>
          </div>

          <div className="pb-3 text-muted text-lg font-light">—</div>

          <div className="flex-1">
            <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wide">Max</label>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={MAX_SLIDER}
                step={STEP}
                value={maxInput}
                onChange={e => setMaxInput(e.target.value)}
                onBlur={commitMax}
                className={inp}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm">€</span>
            </div>
          </div>
        </div>

        {/* Dual slider */}
        <DualSlider
          min={minAmt}
          max={maxAmt}
          onMinChange={handleSliderMin}
          onMaxChange={handleSliderMax}
        />
        <div className="flex justify-between text-xs text-muted mt-2">
          <span>0 €</span>
          <span className="font-medium text-primary">
            {fmt(minAmt)} € — {fmt(maxAmt)} €
          </span>
          <span>{fmt(MAX_SLIDER)} €</span>
        </div>
      </div>

      {/* ── Section 2 : Disponibilité ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div>
          <h2 className="font-serif text-xl text-[#1C3B2E] mb-1">Votre disponibilité</h2>
          <p className="text-xs text-muted bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 mt-2 leading-relaxed">
            🔒 Ces informations restent privées — seul le porteur de projet voit une synthèse agrégée, jamais vos détails.
          </p>
        </div>

        {/* Quand ? */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Quand cet argent serait-il disponible ?
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABILITIES.map(a => (
              <Chip
                key={a.value}
                label={a.label}
                selected={availability === a.value}
                onClick={() => setAvailability(a.value)}
              />
            ))}
          </div>
        </div>

        {/* Comment verser ? */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Comment préférez-vous verser ?
          </label>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map(p => (
              <Chip
                key={p.value}
                label={p.label}
                selected={paymentMethod === p.value}
                onClick={() => setPaymentMethod(p.value)}
              />
            ))}
          </div>
        </div>

        {/* Sur quelle durée ? */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Sur quelle durée ?
          </label>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_DURATIONS.map(d => (
              <Chip
                key={d.value}
                label={d.label}
                selected={paymentDuration === d.value}
                onClick={() => setPaymentDuration(d.value)}
              />
            ))}
          </div>
        </div>

        {/* Durée de remboursement (prêt) */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Si c&apos;est un prêt, sur quelle durée souhaitez-vous être remboursé(e) ?
          </label>
          <div className="flex flex-wrap gap-2">
            {LOAN_REPAYMENT_DURATIONS.map(d => (
              <Chip
                key={d.value}
                label={d.label}
                selected={loanRepaymentDuration === d.value}
                onClick={() => setLoanRepaymentDuration(d.value)}
              />
            ))}
          </div>
        </div>

        {/* Fréquence de remboursement */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Quelle fréquence de remboursement vous conviendrait ?
          </label>
          <div className="flex flex-wrap gap-2">
            {REPAYMENT_FREQUENCIES.map(f => (
              <Chip
                key={f.value}
                label={f.label}
                selected={repaymentFrequency === f.value}
                onClick={() => setRepaymentFrequency(f.value)}
              />
            ))}
          </div>
        </div>

        <p className="text-xs text-muted italic">Tous les champs de cette section sont facultatifs.</p>
      </div>

      {/* ── Section 3 : Visibilité ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
        <h2 className="font-serif text-xl text-[#1C3B2E] mb-3">Visibilité du montant</h2>

        <SelectCard
          icon={<EyeOff size={18} />}
          title="Montant visible uniquement par moi"
          subtitle="Seule la fourchette agrégée sera visible"
          selected={amountVisibility === 'private'}
          onClick={() => setAmountVisibility('private')}
        />
        <SelectCard
          icon={<Eye size={18} />}
          title={`Partager avec ${ownerFirstName}`}
          subtitle={`${ownerFirstName} verra votre montant exact`}
          selected={amountVisibility === 'shared'}
          onClick={() => setAmountVisibility('shared')}
        />

        <div className="flex items-start gap-2 mt-3 text-xs text-muted bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 leading-relaxed">
          <Lock size={13} className="shrink-0 mt-0.5" />
          <span>
            Votre montant exact n&apos;est jamais partagé sans votre accord. Seule une fourchette agrégée de l&apos;ensemble de la famille est communiquée au porteur de projet.
          </span>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {/* ── Submit ── */}
      <button type="submit" disabled={loading} className={btnPrimary}>
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? 'Enregistrement…' : 'Confirmer ma capacité'}
      </button>
    </form>
  )
}

const inp = 'w-full px-3 py-2.5 pr-8 rounded-xl border border-gray-200 text-sm text-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition'
const btnPrimary = 'w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
