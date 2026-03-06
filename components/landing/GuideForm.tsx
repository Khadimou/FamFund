'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Mail } from 'lucide-react'

export default function GuideForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Une erreur est survenue. Réessayez.')

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence mode="wait">
      {submitted ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="rounded-2xl p-8 text-center bg-primary/10 border border-primary/20 max-w-md mx-auto"
        >
          <div className="w-12 h-12 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={22} className="text-primary-light" />
          </div>
          <p className="font-semibold text-lg text-white mb-1">
            Vérifiez votre boîte mail !
          </p>
          <p className="text-sm text-white/60 leading-relaxed">
            Le lien de téléchargement vient d&apos;être envoyé à <strong className="text-white/80">{email}</strong>.
            Il est valable 7 jours.
          </p>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-3 max-w-md mx-auto w-full"
        >
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl border bg-[#1B2D22] border-[#27412E] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-light/40 focus:border-primary-light transition disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold bg-accent text-primary-dark hover:bg-accent-light shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Envoi…' : 'Recevoir le guide'}
            </button>
          </form>

          {error && <p className="text-sm text-red-300">{error}</p>}

          <p className="text-xs text-white/40 text-center">
            Gratuit · Livraison immédiate par email · Aucune carte bancaire
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
