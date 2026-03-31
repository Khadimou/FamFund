'use client'

import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { addMember, updateMember } from '@/app/actions/famille'

const RELATIONS   = ['Père', 'Mère', 'Frère', 'Sœur', 'Oncle', 'Tante', 'Grand-père', 'Grand-mère', 'Cousin(e)', 'Conjoint(e)', 'Ami(e)', 'Autre']
const CONTRIB_TYPES = [
  { value: 'pret',           label: 'Prêt'           },
  { value: 'don',            label: 'Don'             },
  { value: 'investissement', label: 'Investissement'  },
]
const AVAILABILITIES = [
  { value: 'immediate',     label: 'Immédiatement'  },
  { value: '1_3_mois',      label: '1 à 3 mois'     },
  { value: '3_6_mois',      label: '3 à 6 mois'     },
  { value: 'plus_6_mois',   label: 'Plus de 6 mois' },
  { value: 'non_renseigne', label: 'Non renseigné'  },
]

export interface MemberData {
  id: string
  first_name: string | null
  last_name: string | null
  relation: string | null
  email: string | null
  phone: string | null
  amount: number | null
  contribution_type: string | null
  availability: string | null
  status: string
}

interface Props {
  projectId: string
  member?: MemberData | null  // null = mode ajout
  onClose: (warning?: string) => void
}

const EMPTY = { firstName: '', lastName: '', relation: '', email: '', phone: '', amount: '', contributionType: '', availability: 'non_renseigne' }

export default function MemberModal({ projectId, member, onClose }: Props) {
  const isEdit = !!member
  const [fields, setFields] = useState(EMPTY)
  const [loading, setLoading]  = useState(false)
  const [error, setError]      = useState('')

  useEffect(() => {
    if (member) {
      setFields({
        firstName:        member.first_name        ?? '',
        lastName:         member.last_name         ?? '',
        relation:         member.relation          ?? '',
        email:            member.email             ?? '',
        phone:            member.phone             ?? '',
        amount:           member.amount != null ? String(member.amount) : '',
        contributionType: member.contribution_type ?? '',
        availability:     member.availability      ?? 'non_renseigne',
      })
    }
  }, [member])

  function set(key: keyof typeof EMPTY) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFields(p => ({ ...p, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!fields.email.trim() && !fields.phone.trim()) {
      setError('Un email ou un numéro de téléphone est obligatoire pour envoyer l\'invitation.')
      return
    }

    setLoading(true)
    setError('')

    const result = isEdit
      ? await updateMember(member!.id, fields)
      : await addMember({ ...fields, projectId })

    if (result.error) { setError(result.error); setLoading(false); return }
    if ('emailWarning' in result && result.emailWarning) {
      // Membre ajouté mais email non envoyé — on ferme avec un warning
      onClose(result.emailWarning as string)
      return
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => onClose()} />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="font-semibold text-text">
            {isEdit ? 'Modifier le membre' : 'Inviter un membre'}
          </h2>
          <button onClick={() => onClose()} className="text-muted hover:text-text transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Prénom / Nom */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prénom" required>
              <input type="text" value={fields.firstName} onChange={set('firstName')} required placeholder="Marie" className={inp} />
            </Field>
            <Field label="Nom" required>
              <input type="text" value={fields.lastName}  onChange={set('lastName')}  required placeholder="Dupont" className={inp} />
            </Field>
          </div>

          {/* Relation */}
          <Field label="Lien de parenté">
            <select value={fields.relation} onChange={set('relation')} className={inp}>
              <option value="">Sélectionner…</option>
              {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email" hint="ou téléphone">
              <input type="email" value={fields.email} onChange={set('email')} placeholder="marie@email.com" className={inp} />
            </Field>
            <Field label="Téléphone" hint="ou email">
              <input type="tel" value={fields.phone} onChange={set('phone')} placeholder="+33 6 …" className={inp} />
            </Field>
          </div>
          <p className="text-xs text-muted -mt-1">
            Au moins l'un des deux est requis pour envoyer l'invitation.
          </p>

          {/* Contribution */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Montant estimé (€)">
              <input type="number" min={0} step={100} value={fields.amount} onChange={set('amount')} placeholder="5 000" className={inp} />
            </Field>
            <Field label="Type de contribution">
              <select value={fields.contributionType} onChange={set('contributionType')} className={inp}>
                <option value="">Type…</option>
                {CONTRIB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
          </div>

          {/* Disponibilité */}
          <Field label="Disponibilité des fonds">
            <select value={fields.availability} onChange={set('availability')} className={inp}>
              {AVAILABILITIES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </Field>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => onClose()} className={btnSecondary}>Annuler</button>
            <button type="submit" disabled={loading} className={btnPrimary}>
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Inviter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-text">
        {label}
        {required && <span className="text-accent ml-0.5">*</span>}
        {hint && <span className="text-muted font-normal text-xs ml-1">({hint})</span>}
      </label>
      {children}
    </div>
  )
}

const inp = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-text placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition'
const btnPrimary   = 'flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
const btnSecondary = 'px-5 py-2.5 rounded-xl border border-gray-200 text-text font-semibold text-sm hover:bg-gray-50 transition-colors'
