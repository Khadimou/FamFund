import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function BackButton() {
  return (
    <Link
      href="/dashboard"
      style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: '#6b6b65', textDecoration: 'none' }}
    >
      <ArrowLeft size={15} />
      Retour
    </Link>
  )
}
