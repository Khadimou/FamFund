import { CheckCircle, Clock, XCircle } from 'lucide-react'

export interface MemberData {
  id: string
  user_id: string | null
  member_status: 'invited' | 'joined' | 'declined'
  joined_at: string | null
  name?: string
  email?: string
  pledge_amount: number | null
  pledge_type: string | null
  pledge_status: string | null
}

const STATUS_ICON = {
  joined:   <CheckCircle size={14} className="text-primary" />,
  invited:  <Clock size={14} className="text-amber-500" />,
  declined: <XCircle size={14} className="text-red-400" />,
}

const STATUS_LABEL = {
  joined:   'Actif',
  invited:  'En attente',
  declined: 'Décliné',
}

const PLEDGE_TYPE_LABEL: Record<string, string> = {
  loan:   'Prêt',
  gift:   'Don',
  equity: 'Prise de participation',
}

export default function MemberRow({ member }: { member: MemberData }) {
  const displayName = member.name ?? member.email ?? 'Invité'
  const initial = displayName[0].toUpperCase()
  const icon = STATUS_ICON[member.member_status]
  const statusLabel = STATUS_LABEL[member.member_status]

  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0">
      {/* Avatar + identité */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold shrink-0">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-text truncate">{displayName}</p>
          {member.email && member.name && (
            <p className="text-xs text-muted truncate">{member.email}</p>
          )}
        </div>
      </div>

      {/* Engagement + statut */}
      <div className="flex items-center gap-4 shrink-0 ml-4">
        {member.pledge_amount != null ? (
          <div className="text-right">
            <p className="text-sm font-semibold text-primary">
              {member.pledge_amount.toLocaleString('fr-FR')} €
            </p>
            {member.pledge_type && (
              <p className="text-xs text-muted">{PLEDGE_TYPE_LABEL[member.pledge_type] ?? member.pledge_type}</p>
            )}
          </div>
        ) : (
          <span className="text-xs text-muted italic">Pas encore renseigné</span>
        )}

        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-xs text-muted">{statusLabel}</span>
        </div>
      </div>
    </div>
  )
}
