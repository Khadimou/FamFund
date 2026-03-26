'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast-context'
import { isBlockedDomain } from '@/lib/blocked-domains'

interface WaitlistFormProps {
  source: string
  /** Affiche le formulaire sur fond sombre (section CTA verte) */
  dark?: boolean
}

export default function WaitlistForm({ source, dark = false }: WaitlistFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (isBlockedDomain(email)) {
      setError("Cette adresse email n'est pas acceptée.")
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Une erreur est survenue. Réessayez.')

      setSubmitted(true)
      toast({
        title: 'Vous êtes sur la liste !',
        description: `Vous êtes #${data.position} à avoir rejoint. On vous prévient dès le lancement.`,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence mode="wait">
      {submitted ? (
        /* ── Confirmation post-inscription ── */
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className={`rounded-2xl p-7 text-center max-w-md border ${
            dark ? 'bg-white/10 border-white/20' : 'bg-primary/10 border-primary/20'
          }`}
        >
          <p className="text-3xl mb-3">🎉</p>
          <p className={`font-semibold text-lg ${dark ? 'text-white' : 'text-primary'}`}>
            Vous êtes inscrit(e) !
          </p>
          <p className={`text-sm mt-1.5 leading-relaxed ${dark ? 'text-white/70' : 'text-muted'}`}>
            On vous contacte en priorité au lancement.
          </p>
        </motion.div>
      ) : (
        /* ── Formulaire ── */
        <motion.div
          key="form"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-3 max-w-md w-full"
        >
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              disabled={loading}
              className={`flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition disabled:opacity-60 ${
                dark
                  ? 'bg-[#1B2D22] border-[#27412E] text-white placeholder:text-white/40 focus:ring-primary-light/40 focus:border-primary-light'
                  : 'bg-white border-gray-200 text-text placeholder:text-gray-400 focus:ring-primary/30 focus:border-primary'
              }`}
            />
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap ${
                dark
                  ? 'bg-accent text-primary-dark hover:bg-accent-light shadow-lg shadow-accent/25 hover:shadow-accent/40'
                  : 'bg-primary text-white hover:bg-primary-dark shadow-md'
              }`}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Inscription…' : "Obtenir mon accès anticipé"}
            </button>
          </form>

          {error && (
            <p className={`text-sm ${dark ? 'text-red-300' : 'text-red-500'}`}>{error}</p>
          )}

          <p className={`text-xs ${dark ? 'text-white/50' : 'text-muted'}`}>
            Accès gratuit · Aucune carte bancaire · Lancement Printemps 2026
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
