'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function BackButton() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: '#6b6b65', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
    >
      <ArrowLeft size={15} />
      Retour
    </button>
  )
}
