import { requireAuth } from '@/lib/auth'
import { apiGet, ApiError } from '@/lib/api'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Euro, Target, Users } from 'lucide-react'
import ProgressBar from '@/components/app/ProgressBar'
import MemberRow, { type MemberData } from '@/components/app/MemberRow'
import GroupActions from '@/components/app/GroupActions'
import type { GroupDashboardData } from '@/components/app/GroupCard'

export const dynamic = 'force-dynamic'

interface GroupDetailPageProps {
  params: { id: string }
}

export default async function GroupDetailPage({ params }: GroupDetailPageProps) {
  const token = requireAuth()

  let dashboard: GroupDashboardData
  let members: MemberData[]

  try {
    ;[dashboard, members] = await Promise.all([
      apiGet<GroupDashboardData>(`/groups/${params.id}/dashboard`, token),
      apiGet<MemberData[]>(`/groups/${params.id}/members`, token),
    ])
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  const fmt = (n: number) => n.toLocaleString('fr-FR')

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Fil d'Ariane */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors mb-7"
      >
        <ChevronLeft size={16} />
        Tableau de bord
      </Link>

      {/* En-tête */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-text">{dashboard.name}</h1>
          <p className="text-muted mt-1 text-sm">Tableau de bord privé — visible uniquement par vous</p>
        </div>
        <GroupActions groupId={params.id} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={<Euro size={18} className="text-primary" />}
          label="Engagé"
          value={`${fmt(dashboard.pledged_amount)} €`}
          sub={`dont ${fmt(dashboard.funded_amount)} € versé`}
        />
        <StatCard
          icon={<Target size={18} className="text-primary" />}
          label="Objectif"
          value={`${fmt(dashboard.goal_amount)} €`}
          sub={dashboard.deadline ? `avant le ${new Date(dashboard.deadline).toLocaleDateString('fr-FR')}` : undefined}
        />
        <StatCard
          icon={<Users size={18} className="text-primary" />}
          label="Membres"
          value={`${dashboard.joined_count}/${dashboard.member_count}`}
          sub={`${dashboard.pending_count} en attente de réponse`}
        />
      </div>

      {/* Barre de progression */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <ProgressBar value={dashboard.completion_pct} showLabel />
        <p className="text-xs text-muted mt-3">
          {dashboard.completion_pct < 100
            ? `Il manque ${fmt(dashboard.goal_amount - dashboard.pledged_amount)} € pour atteindre l'objectif.`
            : "Objectif atteint !"}
        </p>
      </div>

      {/* Liste des membres */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-text mb-1">
          Membres ({members.length})
        </h2>
        <p className="text-xs text-muted mb-5">
          Les montants individuels sont confidentiels pour chaque membre.
        </p>

        {members.length === 0 ? (
          <p className="text-center text-muted py-8 text-sm">
            Aucun membre pour l'instant. Invitez vos proches avec le bouton ci-dessus.
          </p>
        ) : (
          <div>
            {members.map((m) => (
              <MemberRow key={m.id} member={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-muted uppercase tracking-wide">{label}</span>
      </div>
      <p className="font-serif text-2xl text-text font-bold">{value}</p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  )
}
