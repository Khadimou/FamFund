'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Clock, CheckCircle2, AlertTriangle,
  Bell, Download, ArrowUpRight, CalendarDays, ChevronDown, ChevronRight,
} from 'lucide-react'
import { toggleReminders } from '@/app/actions/remboursements'

/* ── Types ── */
interface Repayment {
  id: string
  amount: number
  due_date: string
  status: 'paye' | 'a_venir' | 'en_retard'
  family_members:
    | { first_name: string | null; last_name: string | null }[]
    | { first_name: string | null; last_name: string | null }
    | null
}

interface MonthGroup {
  key: string          // "2026-05"
  label: string        // "Mai 2026"
  total: number
  status: 'paye' | 'a_venir' | 'en_retard' | 'mixed'
  items: Repayment[]
}

interface Project {
  id: string
  name: string
  goal_amount: number | null
  reminders_enabled: boolean
}

interface Props {
  project:     Project
  repayments:  Repayment[]
}

/* ── Helpers ── */
const fmt     = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

function memberName(r: Repayment): string {
  const m = Array.isArray(r.family_members) ? r.family_members[0] ?? null : r.family_members
  if (!m) return '—'
  return [m.first_name, m.last_name].filter(Boolean).join(' ') || '—'
}

function daysFromNow(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000)
}

function groupByMonth(repayments: Repayment[]): MonthGroup[] {
  const map = new Map<string, Repayment[]>()
  for (const r of repayments) {
    const key = r.due_date.slice(0, 7) // "YYYY-MM"
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(r)
  }
  return Array.from(map.entries()).map(([key, items]) => {
    const [year, month] = key.split('-')
    const label = new Date(Number(year), Number(month) - 1, 1)
      .toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    const total = items.reduce((s, r) => s + Number(r.amount), 0)
    const statuses = new Set(items.map(r => r.status))
    const status: MonthGroup['status'] =
      statuses.size === 1 ? (statuses.values().next().value as MonthGroup['status']) : 'mixed'
    return { key, label, total, status, items }
  })
}

/* ── Status config ── */
const STATUS_DOT: Record<string, string> = {
  paye:     'bg-green-500',
  a_venir:  'bg-gray-300',
  en_retard:'bg-orange-400',
  mixed:    'bg-blue-300',
}
const STATUS_LINE: Record<string, string> = {
  paye:     'bg-green-200',
  a_venir:  'bg-gray-100',
  en_retard:'bg-orange-100',
  mixed:    'bg-gray-100',
}
const STATUS_CARD: Record<string, string> = {
  paye:     'bg-green-50/60 border-green-100',
  a_venir:  'bg-white border-gray-100',
  en_retard:'bg-orange-50/60 border-orange-100',
  mixed:    'bg-white border-gray-100',
}
const STATUS_AMT: Record<string, string> = {
  paye:     'text-green-700',
  a_venir:  'text-text',
  en_retard:'text-orange-600',
  mixed:    'text-text',
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'paye')      return <span className="text-xs font-medium text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">Payé</span>
  if (status === 'en_retard') return <span className="text-xs font-medium text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-full">En retard</span>
  if (status === 'mixed')     return <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">Partiel</span>
  return <span className="text-xs font-medium text-muted bg-gray-100 px-2.5 py-0.5 rounded-full">À venir</span>
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'paye')      return <CheckCircle2 size={16} className="text-green-600 shrink-0" />
  if (status === 'en_retard') return <AlertTriangle size={16} className="text-orange-500 shrink-0" />
  return <Clock size={16} className="text-muted shrink-0" />
}

/* ══════════════════════════════════════════════════════════════════════ */
export default function RemboursementsClient({ project, repayments }: Props) {
  const [reminders,    setReminders]    = useState(project.reminders_enabled)
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())
  const [, startTransition]             = useTransition()

  const groups = groupByMonth(repayments)

  /* Calculs globaux */
  const totalDu     = repayments.reduce((s, r) => s + Number(r.amount), 0)
  const totalPaye   = repayments.filter(r => r.status === 'paye').reduce((s, r) => s + Number(r.amount), 0)
  const progressPct = totalDu > 0 ? Math.min(100, (totalPaye / totalDu) * 100) : 0

  /* Prochain virement */
  const nextRepayment = repayments.find(r => r.status === 'a_venir' || r.status === 'en_retard') ?? null
  const nextDays      = nextRepayment ? daysFromNow(nextRepayment.due_date) : null

  function toggleExpand(key: string) {
    setExpandedKeys(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  function handleToggleReminders() {
    const next = !reminders
    setReminders(next)
    startTransition(async () => { await toggleReminders(project.id, next) })
  }

  function handleExport() {
    const rows = repayments.map(r => {
      const name   = memberName(r)
      const date   = fmtDate(r.due_date)
      const status = r.status === 'paye' ? 'Payé' : r.status === 'en_retard' ? 'En retard' : 'À venir'
      return `${date} | ${name} | ${fmt(Number(r.amount))} € | ${status}`
    }).join('\n')

    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html><head><title>Échéancier — ${project.name}</title>
      <style>
        body { font-family: Georgia, serif; padding: 48px; color: #1A1A1A; max-width: 700px; margin: 0 auto; }
        h1 { font-size: 22px; color: #1C3B2E; margin-bottom: 4px; }
        p.sub { color: #6B7280; font-size: 13px; margin-bottom: 32px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { text-align: left; padding: 8px 12px; border-bottom: 2px solid #E5E7EB; color: #6B7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
        td { padding: 10px 12px; border-bottom: 1px solid #F3F4F6; }
        tr.paye td { color: #15803D; }
        tr.en_retard td { color: #EA580C; font-weight: 600; }
        .total { margin-top: 24px; font-size: 13px; color: #6B7280; }
        .total strong { color: #1A1A1A; }
        @media print { body { padding: 24px; } }
      </style></head><body>
      <h1>${project.name}</h1>
      <p class="sub">Échéancier de remboursements · Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
      <table>
        <thead><tr><th>Date</th><th>Bénéficiaire</th><th>Montant</th><th>Statut</th></tr></thead>
        <tbody>
          ${repayments.map(r => {
            const st = r.status === 'paye' ? 'Payé' : r.status === 'en_retard' ? 'En retard' : 'À venir'
            return `<tr class="${r.status}"><td>${fmtDate(r.due_date)}</td><td>${memberName(r)}</td><td>${fmt(Number(r.amount))} €</td><td>${st}</td></tr>`
          }).join('')}
        </tbody>
      </table>
      <div class="total">Total dû : <strong>${fmt(totalDu)} €</strong> &nbsp;·&nbsp; Total remboursé : <strong>${fmt(totalPaye)} €</strong></div>
      <script>window.onload = () => { window.print(); }<\/script>
      </body></html>`)
    win.document.close()
  }

  /* ── Render ── */
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-3 w-fit">
          <ArrowLeft size={15} />
          Tableau de bord
        </Link>
        <h1 className="font-serif text-3xl text-text">Remboursements</h1>
        <p className="text-muted text-sm mt-1">Suivi de vos échéances et paiements</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Colonne principale ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Progression globale */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs text-muted uppercase tracking-wide mb-4">Tous prêts confondus</p>
            {totalDu === 0 ? (
              <p className="text-sm text-muted">Aucune échéance enregistrée.</p>
            ) : (
              <>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="font-serif text-3xl font-bold text-primary">{fmt(totalPaye)} €</p>
                    <p className="text-xs text-muted mt-0.5">remboursés</p>
                  </div>
                  <p className="text-sm text-muted">
                    sur <span className="font-semibold text-text">{fmt(totalDu)} €</span>
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Échéancier groupé par mois */}
          {groups.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-20 text-center">
              <CalendarDays size={36} className="text-gray-300 mx-auto mb-4" />
              <p className="text-muted font-medium mb-2">Aucune échéance enregistrée</p>
              <p className="text-sm text-muted max-w-xs mx-auto">
                Les échéances apparaîtront ici une fois les contrats générés.
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {groups.map((g, i) => {
                const isLast    = i === groups.length - 1
                const expanded  = expandedKeys.has(g.key)
                const multiMember = g.items.length > 1
                const dot  = STATUS_DOT[g.status]  ?? STATUS_DOT.a_venir
                const line = STATUS_LINE[g.status] ?? STATUS_LINE.a_venir
                const card = STATUS_CARD[g.status] ?? STATUS_CARD.a_venir
                const amt  = STATUS_AMT[g.status]  ?? STATUS_AMT.a_venir

                return (
                  <div key={g.key} className="flex gap-4">
                    {/* Timeline */}
                    <div className="flex flex-col items-center pt-4 shrink-0" style={{ width: 20 }}>
                      <div className={`w-3 h-3 rounded-full shrink-0 ${dot} ring-2 ring-white`} />
                      {!isLast && <div className={`w-0.5 flex-1 mt-1 ${line}`} />}
                    </div>

                    {/* Card */}
                    <div className={`flex-1 mb-3 rounded-2xl border shadow-sm overflow-hidden ${card}`}>
                      {/* Ligne principale (mois) */}
                      <button
                        onClick={() => multiMember && toggleExpand(g.key)}
                        className={`w-full flex items-center justify-between gap-4 px-4 py-3 ${multiMember ? 'cursor-pointer hover:bg-black/[0.02] transition-colors' : 'cursor-default'}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <StatusIcon status={g.status} />
                          <div className="min-w-0 text-left">
                            <p className={`font-semibold text-sm capitalize ${amt}`}>
                              {g.label}
                            </p>
                            {!multiMember && (
                              <p className="text-xs text-muted">{memberName(g.items[0])}</p>
                            )}
                            {multiMember && (
                              <p className="text-xs text-muted">{g.items.length} contributeurs</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <p className={`text-sm font-semibold ${amt}`}>{fmt(g.total)} €</p>
                            {multiMember && (
                              <p className="text-xs text-muted">total</p>
                            )}
                          </div>
                          <StatusBadge status={g.status} />
                          {multiMember && (
                            <span className="text-muted">
                              {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                            </span>
                          )}
                        </div>
                      </button>

                      {/* Sous-lignes par contributeur (si multi + expanded) */}
                      {multiMember && expanded && (
                        <div className="border-t border-gray-100 divide-y divide-gray-50">
                          {g.items.map(r => (
                            <div key={r.id} className="flex items-center justify-between px-4 py-2.5 pl-10">
                              <p className="text-sm text-muted">{memberName(r)}</p>
                              <div className="flex items-center gap-3">
                                <p className="text-sm font-medium text-text">{fmt(Number(r.amount))} €</p>
                                <StatusBadge status={r.status} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Sidebar droite ── */}
        <div className="space-y-4">

          {/* Prochain virement */}
          {nextRepayment ? (
            <div className="bg-[#1C3B2E] rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={16} className="text-white/60" />
                <p className="text-sm font-semibold text-white/80">Prochain virement</p>
              </div>
              <p className="font-serif text-3xl font-bold mb-1">{fmt(Number(nextRepayment.amount))} €</p>
              <p className="text-white/60 text-sm mb-4">à {memberName(nextRepayment)}</p>
              <div className="bg-white/8 rounded-xl px-4 py-3 flex items-center justify-between mb-4 gap-2 text-sm">
                <span className="text-white/70">
                  Échéance : <span className="text-white font-medium">{fmtDate(nextRepayment.due_date)}</span>
                </span>
                {nextDays !== null && (
                  <span className={`font-semibold shrink-0 ${nextDays < 0 ? 'text-orange-400' : 'text-white'}`}>
                    {nextDays < 0 ? `${Math.abs(nextDays)} j de retard` : nextDays === 0 ? "Aujourd'hui" : `Dans ${nextDays} j`}
                  </span>
                )}
              </div>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#1C3B2E] font-semibold text-sm hover:bg-white/90 transition-colors">
                <ArrowUpRight size={15} />
                Effectuer le virement
              </button>
            </div>
          ) : (
            <div className="bg-[#1C3B2E] rounded-2xl p-5 text-white text-center">
              <CheckCircle2 size={28} className="text-green-400 mx-auto mb-2" />
              <p className="font-semibold">Tout est à jour</p>
              <p className="text-white/60 text-sm mt-1">Aucun virement à effectuer.</p>
            </div>
          )}

          {/* Rappels automatiques */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bell size={16} className="text-muted" />
                <div>
                  <p className="text-sm font-semibold text-text flex items-center gap-2">
                    Rappels automatiques
                    <span className="text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">En Famille</span>
                  </p>
                  <p className="text-xs text-muted">Envoyés 5 j avant l'échéance</p>
                </div>
              </div>
              <button
                onClick={handleToggleReminders}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${reminders ? 'bg-primary' : 'bg-gray-200'}`}
                aria-checked={reminders}
                role="switch"
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${reminders ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* Export PDF */}
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-text font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <Download size={15} className="text-muted" />
            Exporter l'échéancier (PDF)
          </button>

          {/* Upsell */}
          <div className="bg-[#FAF7F2] border border-[#e8e2d9] rounded-2xl p-4 text-center">
            <p className="text-xs font-semibold text-[#2D6A4F] mb-0.5">Plan En Famille</p>
            <p className="text-xs text-muted mb-3 leading-relaxed">
              Rappels, alertes réglementaires et export PDF inclus à 19 €/mois.
            </p>
            <a href="/tarifs" className="inline-block px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors">
              Voir le plan →
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
