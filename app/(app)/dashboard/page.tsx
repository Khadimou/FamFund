import { requireAuth } from '@/lib/auth'
import { apiGet } from '@/lib/api'
import GroupCard, { type GroupDashboardData } from '@/components/app/GroupCard'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const token = requireAuth()

  let groups: GroupDashboardData[] = []
  try {
    groups = await apiGet<GroupDashboardData[]>('/groups/dashboard', token)
  } catch {
    // En cas d'erreur API, on affiche la page vide — pas de crash
  }

  const totalPledged = groups.reduce((acc, g) => acc + g.pledged_amount, 0)
  const activeCount  = groups.filter((g) => g.status === 'active').length

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* En-tête */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-text">Mes groupes</h1>
          <p className="text-muted mt-1">Gérez vos levées de fonds familiales</p>
        </div>
        <Link
          href="/group/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          <PlusCircle size={16} />
          Nouveau groupe
        </Link>
      </div>

      {/* Stats rapides */}
      {groups.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Groupes actifs"   value={String(activeCount)} />
          <StatCard label="Total engagé"     value={`${totalPledged.toLocaleString('fr-FR')} €`} />
          <StatCard label="Groupes au total" value={String(groups.length)} />
        </div>
      )}

      {/* Liste des groupes */}
      {groups.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
          <p className="text-muted mb-5">Vous n'avez pas encore de groupe familial.</p>
          <Link
            href="/group/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            <PlusCircle size={16} />
            Créer mon premier groupe
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <GroupCard key={group.group_id} group={group} />
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <p className="text-xs text-muted uppercase tracking-wide mb-1">{label}</p>
      <p className="font-serif text-2xl text-text font-bold">{value}</p>
    </div>
  )
}
