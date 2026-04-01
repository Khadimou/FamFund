'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { FileText, Plus, ChevronRight, X, Loader2, AlertTriangle } from 'lucide-react'
import { generateDocument, type DocumentType } from '@/app/actions/documents'

/* ── Config ── */
const DOC_TYPE_LABELS: Record<string, string> = {
  loan_agreement:   'Contrat de prêt familial',
  gift_declaration: 'Déclaration de don',
  term_sheet:       'Lettre de conditions (term sheet)',
}

const CONTRIB_TO_DOC: Record<string, DocumentType> = {
  pret:           'loan_agreement',
  don:            'gift_declaration',
  investissement: 'term_sheet',
}

const STATUS_CFG = {
  draft:             { label: 'Brouillon',       cls: 'bg-gray-100 text-gray-600'        },
  pending_signature: { label: 'En attente',       cls: 'bg-amber-100 text-amber-700'      },
  signed:            { label: 'Signé par tous',   cls: 'bg-green-100 text-green-700'      },
} as const

const fmt = (n: number) => n.toLocaleString('fr-FR')

/* ── Types ── */
interface Doc {
  id: string
  type: string
  amount: number | null
  duration_months: number | null
  interest_rate: number | null
  status: string
  lender_signed_at: string | null
  borrower_signed_at: string | null
  created_at: string
  family_members: { first_name: string | null; last_name: string | null } | null
}

interface Member {
  id: string
  first_name: string | null
  last_name: string | null
  contribution_type: string | null
  status: string
}

interface Props {
  documents:  Doc[]
  members:    Member[]
  projectId:  string
}

/* ── Signature label ── */
function sigLabel(doc: Doc) {
  const l = !!doc.lender_signed_at
  const b = !!doc.borrower_signed_at
  if (l && b) return { text: 'Signé par tous', cls: 'bg-green-100 text-green-700' }
  if (l || b) return { text: '1/2 signé',       cls: 'bg-blue-100 text-blue-700'  }
  return { text: 'En attente',  cls: 'bg-amber-100 text-amber-700' }
}

/* ══════════════════════════════════════════════════════════════════════ */
export default function DocumentList({ documents, members, projectId }: Props) {
  const [modalOpen, setModalOpen]   = useState(false)
  const [memberId,  setMemberId]    = useState('')
  const [docType,   setDocType]     = useState<DocumentType>('loan_agreement')
  const [error,     setError]       = useState('')
  const [isPending, startTransition] = useTransition()

  const selectedMember = members.find(m => m.id === memberId)
  // Auto-derive doc type from member contribution_type
  function handleMemberChange(id: string) {
    setMemberId(id)
    const m = members.find(m => m.id === id)
    if (m?.contribution_type && CONTRIB_TO_DOC[m.contribution_type]) {
      setDocType(CONTRIB_TO_DOC[m.contribution_type])
    }
  }

  function handleGenerate() {
    if (!memberId) { setError('Sélectionnez un membre.'); return }
    setError('')
    startTransition(async () => {
      await generateDocument(projectId, memberId, docType)
    })
  }

  return (
    <>
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-text">Documents</h1>
          <p className="text-muted text-sm mt-1">Contrats et déclarations de votre collecte</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          <Plus size={16} />
          Générer un document
        </button>
      </div>

      {/* ── Liste ── */}
      {documents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-24 text-center">
          <FileText size={36} className="text-gray-300 mx-auto mb-4" />
          <p className="text-muted mb-2 font-medium">Aucun document généré</p>
          <p className="text-sm text-muted mb-6 max-w-xs mx-auto">
            Générez un contrat de prêt ou une déclaration de don pour chaque contributeur.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            <Plus size={15} />
            Générer le premier document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {documents.map(doc => {
            const sig   = sigLabel(doc)
            const label = DOC_TYPE_LABELS[doc.type] ?? doc.type
            const member = doc.family_members
            return (
              <Link
                key={doc.id}
                href={`/documents/${doc.id}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-primary/20 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                      <FileText size={17} className="text-primary" />
                    </div>
                    <p className="font-semibold text-text text-sm leading-snug">{label}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                </div>

                {member && (
                  <p className="text-sm text-muted mb-2">
                    {member.first_name} {member.last_name}
                  </p>
                )}

                <div className="flex items-center gap-2 text-xs text-muted mb-3">
                  {doc.amount != null && <span className="font-medium text-text">{fmt(doc.amount)} €</span>}
                  {doc.amount != null && doc.duration_months && <span>·</span>}
                  {doc.duration_months && <span>{doc.duration_months} mois</span>}
                  {doc.interest_rate != null && <span>·</span>}
                  {doc.interest_rate != null && <span>{doc.interest_rate}%</span>}
                </div>

                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sig.cls}`}>
                  {sig.text}
                </span>
              </Link>
            )
          })}
        </div>
      )}

      {/* ── Modal générer ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="font-semibold text-text">Générer un document</h2>
              <button onClick={() => setModalOpen(false)} className="text-muted hover:text-text transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text">
                  Membre concerné <span className="text-accent">*</span>
                </label>
                {members.length === 0 ? (
                  <p className="text-sm text-amber-600 bg-amber-50 rounded-xl px-3 py-2">
                    Aucun membre invité. Ajoutez d'abord des membres dans la page Famille.
                  </p>
                ) : (
                  <select
                    value={memberId}
                    onChange={e => handleMemberChange(e.target.value)}
                    className={inp}
                  >
                    <option value="">Sélectionner un membre…</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.first_name} {m.last_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text">Type de document</label>
                <select value={docType} onChange={e => setDocType(e.target.value as DocumentType)} className={inp}>
                  <option value="loan_agreement">Contrat de prêt familial</option>
                  <option value="gift_declaration">Déclaration de don</option>
                  <option value="term_sheet">Lettre de conditions (term sheet)</option>
                </select>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-text font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isPending || members.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPending && <Loader2 size={15} className="animate-spin" />}
                  {isPending ? 'Génération…' : 'Générer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const inp = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition'
