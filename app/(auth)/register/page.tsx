'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur lors de la création du compte.')

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <Link href="/" className="font-serif text-3xl text-primary font-bold">
          FamilyFund
        </Link>
        <p className="text-muted mt-2">Créez votre espace porteur de projet</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text mb-1.5">
              Prénom et nom
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="Marie Martin"
              required
              autoComplete="name"
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition disabled:opacity-60"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="votre@email.com"
              required
              autoComplete="email"
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition disabled:opacity-60"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text mb-1.5">
              Mot de passe <span className="text-muted font-normal">(8 caractères min.)</span>
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="••••••••"
              required
              minLength={8}
              autoComplete="new-password"
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition disabled:opacity-60"
            />
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-text mb-1.5">
              Confirmer le mot de passe
            </label>
            <input
              id="confirm"
              type="password"
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition disabled:opacity-60"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 px-4 py-2.5 rounded-xl">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Création…' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
