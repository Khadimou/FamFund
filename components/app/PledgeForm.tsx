'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface InviteInfo {
  token: string
  group_name: string
  invited_name: string
  goal_amount: number
  currency: string
}

export default function PledgeForm({ invite }: { invite: InviteInfo }) {
  const [form, setForm] = useState({
    name: invite.invited_name,
    password: '',
    confirmPassword: '',
    amount: '',
    type: 'loan' as 'loan' | 'gift' | 'equity',
    interest_rate: '',
    duration_months: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const router = useRouter()

  const set =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/invite/${invite.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: invite.token,
          name: form.name,
          password: form.password,
          amount: parseFloat(form.amount),
          type: form.type,
          interest_rate: form.type === 'loan' && form.interest_rate ? parseFloat(form.interest_rate) : null,
          duration_months: form.type === 'loan' && form.duration_months ? parseInt(form.duration_months) : null,
          notes: form.notes || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur lors de la soumission.')

      setDone(true)
      // Si un token est retourné → connexion automatique → redirection
      if (data.access_token) {
        setTimeout(() => router.push('/dashboard'), 2000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-4">🎉</p>
        <h2 className="font-serif text-2xl text-primary mb-2">Engagement enregistré !</h2>
        <p className="text-muted">
          Merci pour votre soutien. {invite.invited_name.split(' ')[0]} sera prévenu(e).
        </p>
        <p className="text-xs text-muted mt-4">Redirection vers votre espace…</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Identité */}
      <fieldset className="space-y-4">
        <legend className="font-semibold text-text text-sm uppercase tracking-wide text-primary mb-3">
          Votre compte
        </legend>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Votre nom</label>
          <input
            type="text"
            value={form.name}
            onChange={set('name')}
            required
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition disabled:opacity-60"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            Choisir un mot de passe
          </label>
          <input
            type="password"
            value={form.password}
            onChange={set('password')}
            placeholder="8 caractères minimum"
            required
            minLength={8}
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition disabled:opacity-60"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={set('confirmPassword')}
            placeholder="••••••••"
            required
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition disabled:opacity-60"
          />
        </div>
      </fieldset>

      <hr className="border-gray-100" />

      {/* Engagement */}
      <fieldset className="space-y-4">
        <legend className="font-semibold text-text text-sm uppercase tracking-wide text-primary mb-3">
          Mon engagement
        </legend>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Montant</label>
            <div className="relative">
              <input
                type="number"
                value={form.amount}
                onChange={set('amount')}
                placeholder="5000"
                required
                min={1}
                step={100}
                disabled={loading}
                className="w-full px-4 py-3 pr-8 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition disabled:opacity-60"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm">€</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Type</label>
            <select
              value={form.type}
              onChange={set('type')}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition bg-white disabled:opacity-60"
            >
              <option value="loan">Prêt</option>
              <option value="gift">Don</option>
              <option value="equity">Participation</option>
            </select>
          </div>
        </div>

        {form.type === 'loan' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Taux d'intérêt{' '}
                <span className="text-muted font-normal">% / an</span>
              </label>
              <input
                type="number"
                value={form.interest_rate}
                onChange={set('interest_rate')}
                placeholder="0"
                min={0}
                max={20}
                step={0.1}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Durée <span className="text-muted font-normal">mois</span>
              </label>
              <input
                type="number"
                value={form.duration_months}
                onChange={set('duration_months')}
                placeholder="36"
                min={1}
                max={360}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition disabled:opacity-60"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            Note privée <span className="text-muted font-normal">(visible uniquement par vous)</span>
          </label>
          <textarea
            value={form.notes}
            onChange={set('notes')}
            placeholder="Conditions particulières, remarques..."
            rows={2}
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none disabled:opacity-60"
          />
        </div>
      </fieldset>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? 'Envoi…' : 'Confirmer mon engagement'}
      </button>

      <p className="text-xs text-center text-muted">
        Vos données sont strictement confidentielles. Seul le porteur du projet verra le total consolidé.
      </p>
    </form>
  )
}
