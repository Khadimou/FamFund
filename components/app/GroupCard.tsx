import Link from 'next/link'
import ProgressBar from './ProgressBar'

export interface GroupDashboardData {
  group_id: string
  name: string
  goal_amount: number
  pledged_amount: number
  funded_amount: number
  completion_pct: number
  member_count: number
  joined_count: number
  pending_count: number
  status: string
  currency: string
  deadline?: string | null
}

const STATUS_LABELS: Record<string, string> = {
  draft:  'Brouillon',
  active: 'En cours',
  closed: 'Fermé',
  funded: 'Financé',
}

const STATUS_COLORS: Record<string, string> = {
  draft:  'bg-gray-100 text-gray-500',
  active: 'bg-primary/10 text-primary',
  closed: 'bg-orange-50 text-orange-600',
  funded: 'bg-green-50 text-green-700',
}

export default function GroupCard({ group }: { group: GroupDashboardData }) {
  const fmt = (n: number) => n.toLocaleString('fr-FR')
  const statusColor = STATUS_COLORS[group.status] ?? STATUS_COLORS.draft

  return (
    <Link href={`/group/${group.group_id}`}>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer">
        {/* En-tête */}
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0">
            <h3 className="font-semibold text-text truncate">{group.name}</h3>
            <p className="text-xs text-muted mt-0.5">
              {group.joined_count} membre{group.joined_count > 1 ? 's' : ''} actif{group.joined_count > 1 ? 's' : ''}
              {group.pending_count > 0 && ` · ${group.pending_count} en attente`}
            </p>
          </div>
          <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ml-3 ${statusColor}`}>
            {STATUS_LABELS[group.status] ?? group.status}
          </span>
        </div>

        {/* Barre de progression */}
        <ProgressBar value={group.completion_pct} className="mb-3" />

        {/* Montants */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-primary">{fmt(group.pledged_amount)} €</span>
          <span className="text-muted">objectif {fmt(group.goal_amount)} €</span>
        </div>
      </div>
    </Link>
  )
}
