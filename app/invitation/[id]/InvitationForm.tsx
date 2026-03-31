'use client'

import { useState } from 'react'
import { Loader2, CheckCircle } from 'lucide-react'
import { submitContribution } from '@/app/actions/invitation'

const CONTRIB_TYPES = [
  { value: 'pret',           label: 'Prêt — je serai remboursé(e)'           },
  { value: 'don',            label: 'Don — sans attente de remboursement'     },
  { value: 'investissement', label: 'Investissement — je prends une part'    },
]

const AVAILABILITIES = [
  { value: 'immediate',    label: 'Immédiatement'  },
  { value: '1_3_mois',     label: '1 à 3 mois'     },
  { value: '3_6_mois',     label: '3 à 6 mois'     },
  { value: 'plus_6_mois',  label: 'Plus de 6 mois' },
  { value: 'non_renseigne',label: 'Je ne sais pas encore' },
]

interface Props {
  memberId:    string
  memberName:  string
  projectName: string
}

export default function InvitationForm({ memberId, memberName, projectName }: Props) {
  const [amount,           setAmount]           = useState('')
  const [contributionType, setContributionType] = useState('')
  const [availability,     setAvailability]     = useState('')
  const [loading,          setLoading]          = useState(false)
  const [error,            setError]            = useState('')
  const [done,             setDone]             = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!contributionType) { setError('Veuillez choisir un type de contribution.'); return }
    if (!availability)     { setError('Veuillez indiquer une disponibilité.'); return }
    setLoading(true)
    setError('')

    const result = await submitContribution(memberId, { amount, contributionType, availability })
    if (result.error) { setError(result.error); setLoading(false); return }
    setDone(true)
  }

  if (done) {
    return (
      <div className="text-center py-10">
        <CheckCircle size={48} className="text-primary mx-auto mb-4" />
        <p className="font-semibold text-lg text-text mb-2">Merci {memberName.split(' ')[0]} !</p>
        <p className="text-muted text-sm">Votre réponse a bien été enregistrée. Vous serez recontacté(e) prochainement.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Montant */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-text">
          Montant envisagé <span className="text-muted font-normal">(optionnel)</span>
        </label>
        <div className="relative">
          <input
            type="number"
            min={0}
            step={100}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="5 000"
            className={inp}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted text-sm">€</span>
        </div>
        <p className="text-xs text-muted">Ce montant est indicatif et reste strictement confidentiel.</p>
      </div>

      {/* Type de contribution */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-text">
          Type de contribution <span className="text-accent">*</span>
        </label>
        <div className="space-y-2">
          {CONTRIB_TYPES.map(t => (
            <label
              key={t.value}
              className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                contributionType === t.value
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="contributionType"
                value={t.value}
                checked={contributionType === t.value}
                onChange={() => setContributionType(t.value)}
                className="accent-primary"
              />
              <span className="text-sm text-text">{t.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Disponibilité */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-text">
          Quand les fonds seraient-ils disponibles ? <span className="text-accent">*</span>
        </label>
        <select
          value={availability}
          onChange={e => setAvailability(e.target.value)}
          className={inp}
        >
          <option value="">Sélectionner…</option>
          {AVAILABILITIES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
        </select>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button type="submit" disabled={loading} className={btnPrimary}>
        {loading && <Loader2 size={15} className="animate-spin" />}
        {loading ? 'Envoi…' : 'Confirmer ma contribution'}
      </button>

      <p className="text-xs text-muted text-center">
        🔒 Vos informations sont confidentielles et ne seront jamais partagées avec les autres membres.
      </p>
    </form>
  )
}

const inp       = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition'
const btnPrimary = 'w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
