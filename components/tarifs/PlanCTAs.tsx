'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { CheckoutPlan } from '@/app/api/create-checkout-session/route'

const btnBase: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  width: '100%', padding: '14px 24px', borderRadius: 12, fontSize: '0.9rem',
  fontWeight: 500, cursor: 'pointer', border: 'none', letterSpacing: '0.01em',
  textDecoration: 'none', transition: 'all 0.2s ease',
}

async function startCheckout(plan: CheckoutPlan): Promise<string | null> {
  const res = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan }),
  })

  if (res.status === 401) {
    // Non connecté → rediriger vers login avec retour sur tarifs
    return '/auth/login?next=/tarifs'
  }

  const data = await res.json()
  return data.url ?? null
}

/* ── Bouton générique ── */
function CheckoutButton({
  plan, children, style,
}: {
  plan: CheckoutPlan
  children: React.ReactNode
  style: React.CSSProperties
}) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    const url = await startCheckout(plan)
    if (url) window.location.href = url
    else setLoading(false)
  }

  return (
    <button onClick={handleClick} disabled={loading} style={{ ...btnBase, ...style, opacity: loading ? 0.7 : 1 }}>
      {loading && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
      {loading ? 'Redirection…' : children}
    </button>
  )
}

/* ── Exports par plan ── */
export function EnFamilleButton() {
  return (
    <CheckoutButton
      plan="en_famille"
      style={{ background: '#fff', color: '#2D6A4F', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
    >
      Protéger mon projet
    </CheckoutButton>
  )
}

export function AvecAvocatButton() {
  return (
    <CheckoutButton
      plan="avec_avocat"
      style={{ background: '#F4A261', color: '#fff', boxShadow: '0 4px 16px rgba(244,162,97,0.35)' }}
    >
      Sécuriser avec un avocat
    </CheckoutButton>
  )
}

export function GratuitButton() {
  return (
    <a href="/auth/login" style={{ ...btnBase, background: 'transparent', border: '1.5px solid #e8e2d9', color: '#1a1a18', display: 'flex' }}>
      Commencer gratuitement
    </a>
  )
}
