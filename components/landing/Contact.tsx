'use client'

import { useState } from 'react'
import { Loader2, Send, CheckCircle } from 'lucide-react'
import AnimatedSection from './AnimatedSection'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Une erreur est survenue.')
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-20 bg-[#0C1A10]">
      <div className="container mx-auto px-4 max-w-2xl">
        <AnimatedSection className="text-center mb-10">
          <p className="text-white/40 text-sm uppercase tracking-widest font-medium mb-3">
            Contact
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-3">
            Une question ? Écrivez-nous
          </h2>
          <p className="text-white/60">
            On vous répond sous 24h à{' '}
            <a href="mailto:contact@familyfund.fr" className="text-primary-light hover:underline">
              contact@familyfund.fr
            </a>
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          {submitted ? (
            <div className="bg-[#132019] border border-[#27412E] rounded-2xl p-10 text-center">
              <CheckCircle size={40} className="text-primary-light mx-auto mb-4" />
              <p className="text-white font-semibold text-lg mb-1">Message envoyé !</p>
              <p className="text-white/60 text-sm">On vous répond sous 24h.</p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-[#132019] border border-[#27412E] rounded-2xl p-8 space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Nom</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Votre nom"
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl bg-[#1B2D22] border border-[#27412E] text-white placeholder:text-white/30 focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light/30 transition disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl bg-[#1B2D22] border border-[#27412E] text-white placeholder:text-white/30 focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light/30 transition disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Votre question ou remarque..."
                  required
                  disabled={loading}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-[#1B2D22] border border-[#27412E] text-white placeholder:text-white/30 focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light/30 transition disabled:opacity-60 resize-none"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                {loading ? 'Envoi…' : 'Envoyer le message'}
              </button>
            </form>
          )}
        </AnimatedSection>
      </div>
    </section>
  )
}
