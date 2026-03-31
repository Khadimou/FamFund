import Link from 'next/link'
import { PlusCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const groups: never[] = []

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-text">Tableau de bord</h1>
          <p className="text-muted mt-1">Gérez votre levée de fonds familiale</p>
        </div>
      </div>

      <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
        <p className="text-muted text-sm">Votre dashboard arrive bientôt.</p>
      </div>
    </div>
  )
}
