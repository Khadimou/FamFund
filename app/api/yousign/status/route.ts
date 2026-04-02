import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const BASE = process.env.YOUSIGN_API_URL ?? 'https://api-sandbox.yousign.app/v3'

async function ysGet(path: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${process.env.YOUSIGN_API_KEY!}` },
  })
  if (!res.ok) throw new Error(`Yousign ${path} → ${res.status}`)
  return res.json()
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { documentId } = await req.json().catch(() => ({}))
  if (!documentId) return NextResponse.json({ error: 'documentId manquant' }, { status: 400 })

  /* ── Récupère le document ── */
  const { data: doc } = await supabase
    .from('documents')
    .select('id, yousign_request_id, project_id, family_members(email)')
    .eq('id', documentId)
    .single()

  if (!doc?.yousign_request_id) {
    return NextResponse.json({ error: 'Aucune demande de signature trouvée' }, { status: 400 })
  }

  /* ── Interroge Yousign ── */
  const [srData, signersData] = await Promise.all([
    ysGet(`/signature_requests/${doc.yousign_request_id}`),
    ysGet(`/signature_requests/${doc.yousign_request_id}/signers`),
  ])

  const status: string = srData.status  // 'draft' | 'ongoing' | 'done' | 'declined' | 'expired' | 'deleted'
  const signers: any[] = signersData.signers ?? signersData ?? []

  /* ── Détermine les dates de signature ── */
  const member     = Array.isArray(doc.family_members) ? doc.family_members[0] : doc.family_members
  const lenderEmail = (member as any)?.email

  const lenderSigner   = signers.find(s => s.info?.email === lenderEmail)
  const borrowerSigner = signers.find(s => s.info?.email !== lenderEmail)

  const lenderSignedAt   = lenderSigner?.status   === 'done' ? (lenderSigner.signed_at   ?? new Date().toISOString()) : null
  const borrowerSignedAt = borrowerSigner?.status  === 'done' ? (borrowerSigner.signed_at  ?? new Date().toISOString()) : null

  /* ── Mise à jour Supabase ── */
  const admin  = createAdminClient()
  const update: Record<string, unknown> = {}

  if (status === 'done') {
    update.status              = 'signed'
    update.lender_signed_at   = lenderSignedAt   ?? new Date().toISOString()
    update.borrower_signed_at  = borrowerSignedAt ?? new Date().toISOString()
  } else if (status === 'declined' || status === 'expired') {
    update.status              = 'draft'
    update.yousign_request_id  = null
    update.yousign_document_id = null
  } else {
    // ongoing — met à jour les signatures partielles
    if (lenderSignedAt)   update.lender_signed_at   = lenderSignedAt
    if (borrowerSignedAt) update.borrower_signed_at  = borrowerSignedAt
    update.status = 'pending_signature'
  }

  await admin.from('documents').update(update).eq('id', doc.id)

  return NextResponse.json({ status, lenderSignedAt, borrowerSignedAt })
}
