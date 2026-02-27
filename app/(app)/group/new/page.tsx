'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Loader2 } from 'lucide-react'

interface FormState {
  name: string
  description: string
  goal_amount: string
  deadline: string
}

export default function NewGroupPage() {
  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    goal_amount: '',
    deadline: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          goal_amount: parseFloat(form.goal_amount),
          deadline: form.deadline || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur lors de la création.')

      router.push(`/group/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors mb-8"
      >
        <ChevronLeft size={16} />
        Retour au tableau de bord
      </Link>

      <h1 className="font-serif text-3xl text-text mb-2">Nouveau groupe familial</h1>
      <p className="text-muted mb-8">
        Définissez votre projet et votre objectif. Vous inviterez vos proches ensuite.
      </p>

      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nom du projet */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text mb-1.5">
              Nom du projet <span className="text-red-400">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="Ex : Reprise de l'épicerie Martin"
              required
              maxLength={255}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition disabled:opacity-60"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text mb-1.5">
              Description <span className="text-muted font-normal">(optionnel)</span>
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={set('description')}
              placeholder="Décrivez brièvement votre projet à votre famille..."
              rows={3}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none disabled:opacity-60"
            />
          </div>

          {/* Objectif */}
          <div>
            <label htmlFor="goal" className="block text-sm font-medium text-text mb-1.5">
              Montant cible <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                id="goal"
                type="number"
                value={form.goal_amount}
                onChange={set('goal_amount')}
                placeholder="30000"
                required
                min={1}
                step={100}
                disabled={loading}
                className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition disabled:opacity-60"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted text-sm">€</span>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-text mb-1.5">
              Date limite <span className="text-muted font-normal">(optionnel)</span>
            </label>
            <input
              id="deadline"
              type="date"
              value={form.deadline}
              onChange={set('deadline')}
              min={new Date().toISOString().split('T')[0]}
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition disabled:opacity-60"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Link
              href="/dashboard"
              className="flex-1 text-center px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-muted hover:bg-gray-50 transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Création…' : 'Créer le groupe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
