import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProgressBar from '@/components/app/ProgressBar'
import { UserPlus, FileText, CreditCard, TrendingUp, ChevronRight, Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'

/* ── Config statuts ── */
const MEMBER_STATUS = {
  signe:     { label: 'Signé',      cls: 'bg-green-100 text-green-700'  },
  engage:    { label: 'Engagé',     cls: 'bg-blue-100 text-blue-700'    },
  a_repondu: { label: 'A répondu',  cls: 'bg-yellow-100 text-yellow-700'},
  invite:    { label: 'Invité',     cls: 'bg-gray-100 text-gray-600'    },
} as const

const PROJECT_STATUS = {
  en_cours: { label: 'En cours', cls: 'bg-primary/10 text-primary'    },
  pause:    { label: 'En pause', cls: 'bg-yellow-100 text-yellow-700' },
  cloture:  { label: 'Clôturé', cls: 'bg-gray-100 text-gray-500'     },
  success:  { label: 'Réussi',   cls: 'bg-green-100 text-green-700'  },
} as const

const AVAILABILITY = [
  { key: 'immediate',    label: 'Immédiatement', color: 'bg-primary'        },
  { key: '1_3_mois',    label: '1 à 3 mois',    color: 'bg-primary-light'  },
  { key: '3_6_mois',    label: '3 à 6 mois',    color: 'bg-accent'         },
  { key: 'plus_6_mois', label: '+6 mois',        color: 'bg-accent-dark'    },
  { key: 'non_renseigne',label: 'Non renseigné', color: 'bg-gray-200'       },
]

const AVATAR_PALETTE = [
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-teal-100 text-teal-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-cyan-100 text-cyan-700',
]

const fmt     = (n: number) => n.toLocaleString('fr-FR')
const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

/* ── Types ── */
type Repayment = {
  id: string
  amount: number
  due_date: string
  status: string
  family_members: { first_name: string | null; last_name: string | null } | null
}

/* ══════════════════════════════════════════════════════════════ */
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  /* Profil + projet en parallèle */
  const [{ data: profile }, { data: project }] = await Promise.all([
    supabase.from('profiles').select('first_name').eq('id', user.id).single(),
    supabase
      .from('projects')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
  ])

  if (!project) redirect('/onboarding')

  /* Membres + prochain remboursement en parallèle */
  const [{ data: rawMembers }, { data: rawRepayment }] = await Promise.all([
    supabase
      .from('family_members')
      .select('id, first_name, last_name, relation, amount, availability, status')
      .eq('project_id', project.id)
      .order('created_at'),
    supabase
      .from('repayments')
      .select('id, amount, due_date, status, family_members(first_name, last_name)')
      .eq('project_id', project.id)
      .eq('status', 'a_venir')
      .order('due_date')
      .limit(1)
      .single(),
  ])

  const members       = rawMembers ?? []
  const nextRepayment = rawRepayment as Repayment | null

  /* Calculs */
  const goalAmount    = Number(project.goal_amount ?? 0)
  const totalDeclared = members.reduce((s, m) => s + Number(m.amount ?? 0), 0)
  const progressPct   = goalAmount > 0 ? Math.min(100, Math.round((totalDeclared / goalAmount) * 100)) : 0

  const amountsKnown  = members.filter(m => m.amount != null && Number(m.amount) > 0)
  const capacityTotal = amountsKnown.reduce((s, m) => s + Number(m.amount), 0)

  let daysLeft: number | null = null
  if (nextRepayment?.due_date) {
    daysLeft = Math.ceil((new Date(nextRepayment.due_date).getTime() - Date.now()) / 86_400_000)
  }

  const firstName   = profile?.first_name ?? 'vous'
  const statusCfg   = PROJECT_STATUS[project.status as keyof typeof PROJECT_STATUS] ?? PROJECT_STATUS.en_cours

  /* ── Rendu ── */
  return (
    <div className="p-8 max-w-6xl mx-auto">

      {/* En-tête */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-text">
          Bonjour {firstName} 👋
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <p className="text-muted text-sm">{project.name}</p>
          <Badge cls={statusCfg.cls}>{statusCfg.label}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Colonne principale ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Collecte en cours */}
          <Card title="Collecte en cours">
            <ProgressBar value={progressPct} showLabel />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Stat label="Montant déclaré" value={`${fmt(totalDeclared)} €`} accent />
              <Stat label="Objectif"        value={`${fmt(goalAmount)} €`} />
            </div>
            {project.minimum_amount && (
              <p className="text-xs text-muted mt-3">
                Objectif minimum :{' '}
                <span className="font-medium text-text">{fmt(Number(project.minimum_amount))} €</span>
              </p>
            )}
          </Card>

          {/* Membres */}
          <Card
            title="Membres de la famille"
            aside={<span className="text-sm text-muted">{members.length} invité{members.length !== 1 ? 's' : ''}</span>}
          >
            {members.length === 0 ? (
              <Empty message="Aucun membre invité pour l'instant.">
                <Link href="/famille" className={linkCls}>Inviter des proches →</Link>
              </Empty>
            ) : (
              <ul className="divide-y divide-gray-50">
                {members.map((m, i) => {
                  const initials = [m.first_name, m.last_name].filter(Boolean).map(n => n![0].toUpperCase()).join('') || '?'
                  const avatarCls = AVATAR_PALETTE[i % AVATAR_PALETTE.length]
                  const sc = MEMBER_STATUS[m.status as keyof typeof MEMBER_STATUS] ?? MEMBER_STATUS.invite
                  return (
                    <li key={m.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${avatarCls}`}>
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text">{m.first_name} {m.last_name}</p>
                          {m.relation && <p className="text-xs text-muted">{m.relation}</p>}
                        </div>
                      </div>
                      <Badge cls={sc.cls}>{sc.label}</Badge>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>

          {/* Disponibilité */}
          <Card title="Quand l'argent sera disponible">
            {members.length === 0 ? (
              <Empty message="Aucun membre invité pour l'instant." />
            ) : (
              <div className="space-y-4">
                {/* Barre segmentée */}
                <div className="flex rounded-full overflow-hidden h-3 bg-gray-100 gap-px">
                  {AVAILABILITY.map(({ key, color }) => {
                    const count = members.filter(m => m.availability === key).length
                    const pct   = members.length > 0 ? (count / members.length) * 100 : 0
                    return pct > 0 ? (
                      <div key={key} className={`${color} h-full`} style={{ width: `${pct}%` }} title={`${key}: ${count}`} />
                    ) : null
                  })}
                </div>

                {/* Légende */}
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {AVAILABILITY.map(({ key, label, color }) => {
                    const count = members.filter(m => m.availability === key).length
                    return (
                      <div key={key} className="flex items-center gap-1.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                        <span className="text-xs text-muted">{label}</span>
                        <span className="text-xs font-semibold text-text">{count}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Résumé */}
                {(() => {
                  const immCount  = members.filter(m => m.availability === 'immediate').length
                  const soonCount = members.filter(m => ['immediate', '1_3_mois'].includes(m.availability)).length
                  if (immCount > 0)
                    return (
                      <p className="text-xs text-muted bg-primary/5 rounded-xl px-4 py-2.5">
                        <span className="font-medium text-primary">{immCount} membre{immCount > 1 ? 's' : ''}</span>{' '}
                        peu{immCount > 1 ? 'vent' : 't'} contribuer immédiatement
                        {soonCount > immCount && `, et ${soonCount - immCount} autre${soonCount - immCount > 1 ? 's' : ''} dans les 3 mois`}.
                      </p>
                    )
                  if (soonCount > 0)
                    return (
                      <p className="text-xs text-muted bg-primary/5 rounded-xl px-4 py-2.5">
                        <span className="font-medium text-primary">{soonCount} membre{soonCount > 1 ? 's' : ''}</span>{' '}
                        peu{soonCount > 1 ? 'vent' : 't'} contribuer dans les 3 prochains mois.
                      </p>
                    )
                  return null
                })()}
              </div>
            )}
          </Card>

          {/* Prochain remboursement */}
          <Card title="Prochain remboursement">
            {!nextRepayment ? (
              <Empty message="Aucun remboursement à venir.">
                <Link href="/remboursements" className={linkCls}>Configurer l'échéancier →</Link>
              </Empty>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <Calendar size={20} className="text-accent-dark" />
                  </div>
                  <div>
                    <p className="font-semibold text-text">{fmt(nextRepayment.amount)} €</p>
                    <p className="text-sm text-muted">
                      {nextRepayment.family_members?.first_name} {nextRepayment.family_members?.last_name}
                      {' · '}
                      {fmtDate(nextRepayment.due_date)}
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  {daysLeft !== null && (
                    <p className={`text-sm font-semibold ${daysLeft <= 7 ? 'text-accent-dark' : 'text-primary'}`}>
                      {daysLeft <= 0 ? "Aujourd'hui" : `J−${daysLeft}`}
                    </p>
                  )}
                  <Link href="/remboursements" className="text-xs text-primary hover:underline block">
                    Voir →
                  </Link>
                </div>
              </div>
            )}
          </Card>

        </div>

        {/* ── Sidebar droite ── */}
        <div className="space-y-6">

          {/* Capacité familiale */}
          <Card title="Capacité familiale">
            {amountsKnown.length === 0 ? (
              <Empty message="Les membres n'ont pas encore renseigné leurs montants." />
            ) : (
              <div className="space-y-3">
                <div className="text-center py-2">
                  <p className="font-serif text-3xl font-bold text-primary">{fmt(capacityTotal)} €</p>
                  <p className="text-xs text-muted mt-1">déclarés sur {fmt(goalAmount)} € souhaités</p>
                </div>
                <p className="text-xs text-muted bg-gray-50 rounded-xl px-4 py-3 leading-relaxed">
                  🔒 Les montants individuels ne sont jamais affichés à vos proches.
                </p>
              </div>
            )}
          </Card>

          {/* Actions rapides */}
          <Card title="Actions rapides">
            <nav className="space-y-1">
              <QuickAction href="/famille"         icon={<UserPlus size={15} />}   label="Inviter un membre"   />
              <QuickAction href="/documents"       icon={<FileText size={15} />}   label="Générer un document" />
              <QuickAction href="/remboursements"  icon={<CreditCard size={15} />} label="Voir l'échéancier"   />
              <QuickAction href="/lettre-synthese" icon={<TrendingUp size={15} />} label="Lettre de synthèse"  />
            </nav>
          </Card>

        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Composants locaux
══════════════════════════════════════════════════════════════ */

function Card({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-text">{title}</h2>
        {aside}
      </div>
      {children}
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`font-serif text-2xl font-bold ${accent ? 'text-primary' : 'text-text'}`}>{value}</p>
    </div>
  )
}

function Badge({ cls, children }: { cls: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {children}
    </span>
  )
}

function Empty({ message, children }: { message: string; children?: React.ReactNode }) {
  return (
    <div className="text-center py-6">
      <p className="text-sm text-muted">{message}</p>
      {children && <div className="mt-3">{children}</div>}
    </div>
  )
}

function QuickAction({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text hover:bg-primary/5 hover:text-primary transition-colors group"
    >
      <span className="text-muted group-hover:text-primary transition-colors shrink-0">{icon}</span>
      {label}
      <ChevronRight size={14} className="ml-auto text-gray-300 group-hover:text-primary transition-colors" />
    </Link>
  )
}

const linkCls = 'text-sm text-primary font-medium hover:underline'
