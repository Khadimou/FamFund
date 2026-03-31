'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { UserPlus, Mail, Phone, MoreHorizontal, Send, Pencil, Trash2 } from 'lucide-react'
import { deleteMember, resendInvitation } from '@/app/actions/famille'
import MemberModal, { type MemberData } from './MemberModal'

/* ── Config ── */
const STATUS_CFG = {
  signe:     { label: 'Signé',     cls: 'bg-green-100 text-green-800'   },
  engage:    { label: 'Engagé',    cls: 'bg-emerald-100 text-emerald-700'},
  a_repondu: { label: 'A répondu', cls: 'bg-violet-100 text-violet-700' },
  invite:    { label: 'Invité',    cls: 'bg-gray-100 text-gray-600'     },
} as const

const CONTRIB_LABEL: Record<string, string> = {
  pret: 'Prêt', don: 'Don', investissement: 'Investissement',
}

const AVATAR_PALETTE = [
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-teal-100 text-teal-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-cyan-100 text-cyan-700',
]

const FILTERS = [
  { value: 'all',       label: 'Tous'       },
  { value: 'signe',     label: 'Signés'     },
  { value: 'engage',    label: 'Engagés'    },
  { value: 'a_repondu', label: 'A répondu'  },
  { value: 'invite',    label: 'Invités'    },
]

const fmt = (n: number) => n.toLocaleString('fr-FR')

/* ── Types ── */
interface Props {
  members:   MemberData[]
  projectId: string
}

/* ══════════════════════════════════════════════════════════════ */
export default function FamilleClient({ members, projectId }: Props) {
  const [filter,        setFilter]        = useState('all')
  const [modalOpen,     setModalOpen]     = useState(false)
  const [editMember,    setEditMember]    = useState<MemberData | null>(null)
  const [openMenuId,    setOpenMenuId]    = useState<string | null>(null)
  const [feedbackId,    setFeedbackId]    = useState<string | null>(null) // id après relance
  const [, startTransition] = useTransition()

  /* Ferme le menu si clic ailleurs */
  const menuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  /* KPIs */
  const total     = members.length
  const committed = members.filter(m => ['signe', 'engage'].includes(m.status)).length
  const replied   = members.filter(m => m.status === 'a_repondu').length
  const pending   = members.filter(m => m.status === 'invite').length

  /* Filtre */
  const displayed = filter === 'all' ? members : members.filter(m => m.status === filter)

  /* Actions */
  function openAdd()              { setEditMember(null); setModalOpen(true) }
  function openEdit(m: MemberData){ setEditMember(m);    setModalOpen(true) }
  function closeModal()           { setModalOpen(false); setEditMember(null) }

  function handleDelete(id: string) {
    if (!confirm('Supprimer ce membre ? Cette action est irréversible.')) return
    startTransition(async () => { await deleteMember(id) })
  }

  async function handleResend(id: string) {
    const result = await resendInvitation(id)
    if (!result.error) { setFeedbackId(id); setTimeout(() => setFeedbackId(null), 3000) }
  }

  /* ── Rendu ── */
  return (
    <>
      {/* ── En-tête ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-text">Famille</h1>
          <p className="text-muted text-sm mt-1">Gérez votre cercle de contributeurs</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors">
          <UserPlus size={16} />
          Inviter un membre
        </button>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total invités"         value={total}     />
        <KpiCard label="Engagés / Signés"      value={committed} accent />
        <KpiCard label="A répondu"             value={replied}   />
        <KpiCard label="En attente de réponse" value={pending}   muted />
      </div>

      {/* ── Filtres ── */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-primary text-white'
                : 'bg-white border border-gray-200 text-muted hover:border-primary hover:text-primary'
            }`}
          >
            {f.label}
            {f.value !== 'all' && (
              <span className={`ml-1.5 text-xs ${filter === f.value ? 'opacity-70' : 'text-gray-400'}`}>
                {f.value === 'signe'     ? members.filter(m => m.status === 'signe').length
                : f.value === 'engage'   ? members.filter(m => m.status === 'engage').length
                : f.value === 'a_repondu'? members.filter(m => m.status === 'a_repondu').length
                : pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tableau / État vide ── */}
      {displayed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          {members.length === 0 ? (
            <>
              <p className="text-muted mb-3">Aucun membre invité pour l'instant.</p>
              <button onClick={openAdd} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors">
                <UserPlus size={15} />
                Inviter le premier membre
              </button>
            </>
          ) : (
            <p className="text-muted text-sm">Aucun membre avec ce statut.</p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-muted uppercase tracking-wide">
                <th className="text-left px-5 py-3.5 font-medium">Membre</th>
                <th className="text-left px-4 py-3.5 font-medium hidden sm:table-cell">Relation</th>
                <th className="text-left px-4 py-3.5 font-medium hidden md:table-cell">Contact</th>
                <th className="text-left px-4 py-3.5 font-medium hidden lg:table-cell">Contribution</th>
                <th className="text-left px-4 py-3.5 font-medium">Statut</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50" ref={menuRef as React.RefObject<HTMLTableSectionElement>}>
              {displayed.map((m, i) => {
                const initials  = [m.first_name, m.last_name].filter(Boolean).map(n => n![0].toUpperCase()).join('') || '?'
                const avatarCls = AVATAR_PALETTE[i % AVATAR_PALETTE.length]
                const sc        = STATUS_CFG[m.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.invite
                const menuOpen  = openMenuId === m.id

                return (
                  <tr key={m.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Membre */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${avatarCls}`}>
                          {initials}
                        </div>
                        <span className="font-medium text-text">{m.first_name} {m.last_name}</span>
                      </div>
                    </td>

                    {/* Relation */}
                    <td className="px-4 py-4 text-muted hidden sm:table-cell">
                      {m.relation || <span className="text-gray-300">—</span>}
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-4 hidden md:table-cell">
                      {m.email || m.phone ? (
                        <div className="space-y-0.5">
                          {m.email && (
                            <div className="flex items-center gap-1.5 text-muted">
                              <Mail size={12} className="shrink-0" />
                              <span className="truncate max-w-[160px]">{m.email}</span>
                            </div>
                          )}
                          {m.phone && (
                            <div className="flex items-center gap-1.5 text-muted">
                              <Phone size={12} className="shrink-0" />
                              <span>{m.phone}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    {/* Contribution */}
                    <td className="px-4 py-4 hidden lg:table-cell">
                      {m.amount != null ? (
                        <div>
                          <span className="font-medium text-text">{fmt(m.amount)} €</span>
                          {m.contribution_type && (
                            <span className="ml-1.5 text-xs text-muted">
                              {CONTRIB_LABEL[m.contribution_type] ?? m.contribution_type}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    {/* Statut */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sc.cls}`}>
                        {sc.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="relative flex items-center justify-end gap-1">
                        {/* Relancer (invités avec email) */}
                        {m.status === 'invite' && m.email && (
                          <button
                            onClick={() => handleResend(m.id)}
                            title="Relancer"
                            className={`p-1.5 rounded-lg transition-colors ${
                              feedbackId === m.id
                                ? 'text-primary bg-primary/10'
                                : 'text-muted hover:text-primary hover:bg-primary/5'
                            }`}
                          >
                            <Send size={14} />
                          </button>
                        )}

                        {/* Menu ... */}
                        <button
                          onClick={() => setOpenMenuId(menuOpen ? null : m.id)}
                          className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-gray-100 transition-colors"
                        >
                          <MoreHorizontal size={16} />
                        </button>

                        {menuOpen && (
                          <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[140px]">
                            <button
                              onClick={() => { openEdit(m); setOpenMenuId(null) }}
                              className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-text hover:bg-gray-50 transition-colors"
                            >
                              <Pencil size={13} className="text-muted" />
                              Modifier
                            </button>
                            <button
                              onClick={() => { handleDelete(m.id); setOpenMenuId(null) }}
                              className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={13} />
                              Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modale ── */}
      {modalOpen && (
        <MemberModal
          projectId={projectId}
          member={editMember}
          onClose={closeModal}
        />
      )}
    </>
  )
}

/* ── KPI card ── */
function KpiCard({ label, value, accent, muted }: { label: string; value: number; accent?: boolean; muted?: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs text-muted uppercase tracking-wide mb-1">{label}</p>
      <p className={`font-serif text-3xl font-bold ${accent ? 'text-primary' : muted ? 'text-gray-400' : 'text-text'}`}>
        {value}
      </p>
    </div>
  )
}
