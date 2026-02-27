'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'

interface InviteModalProps {
  groupId: string
  onClose: () => void
  onSuccess: (member: { name: string; email: string }) => void
}

export default function InviteModal({ groupId, onClose, onSuccess }: InviteModalProps) {
  const [form, setForm] = useState({ name: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field: 'name' | 'email') => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erreur lors de l'invitation.")

      onSuccess(form)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-text">Inviter un proche</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Prénom et nom</label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="Marie Martin"
              required
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Adresse email</label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="marie@exemple.fr"
              required
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition disabled:opacity-60"
            />
          </div>

          <p className="text-xs text-muted">
            Un email d'invitation avec un lien sécurisé lui sera envoyé.
            Elle saisira son engagement en privé.
          </p>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-muted hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? "Envoi…" : "Envoyer l'invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
