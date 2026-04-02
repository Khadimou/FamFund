import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  /* ── Vérification signature Yousign (optionnelle en sandbox) ── */
  const secret = process.env.YOUSIGN_WEBHOOK_SECRET
  if (secret && secret !== 'REMPLACER') {
    const sig = req.headers.get('x-yousign-signature-256') ?? ''
    const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
    if (sig !== expected) {
      console.error('Yousign webhook: signature invalide')
      return NextResponse.json({ error: 'Signature invalide' }, { status: 401 })
    }
  }

  let body: any
  try { body = JSON.parse(rawBody) } catch { return NextResponse.json({ received: true }) }

  const event     = body.event_name ?? body.event ?? ''
  const requestId = body.data?.signature_request?.id

  if (!requestId) return NextResponse.json({ received: true })

  const supabase = createAdminClient()

  switch (event) {

    /* ── Tous les signataires ont signé ── */
    case 'signature_request.done': {
      const now = new Date().toISOString()
      await supabase
        .from('documents')
        .update({ status: 'signed', lender_signed_at: now, borrower_signed_at: now })
        .eq('yousign_request_id', requestId)

      console.log(`✅ Document signé — request ${requestId}`)
      break
    }

    /* ── Un signataire vient de signer ── */
    case 'signer.done': {
      const signerEmail = body.data?.signer?.info?.email as string | undefined
      if (!signerEmail) break

      const { data: doc } = await supabase
        .from('documents')
        .select('id, family_members(email)')
        .eq('yousign_request_id', requestId)
        .single()

      if (!doc) break

      const member   = Array.isArray(doc.family_members) ? doc.family_members[0] : doc.family_members
      const isLender = (member as any)?.email === signerEmail
      const now      = new Date().toISOString()

      await supabase
        .from('documents')
        .update(isLender ? { lender_signed_at: now } : { borrower_signed_at: now })
        .eq('id', doc.id)

      console.log(`✍️ Signataire ${isLender ? 'prêteur' : 'emprunteur'} — ${signerEmail}`)
      break
    }

    /* ── Refus ou expiration → réinitialisation ── */
    case 'signature_request.declined':
    case 'signature_request.expired': {
      await supabase
        .from('documents')
        .update({ status: 'draft', yousign_request_id: null, yousign_document_id: null })
        .eq('yousign_request_id', requestId)

      console.warn(`↩️ Signature ${event} — request ${requestId}`)
      break
    }
  }

  return NextResponse.json({ received: true })
}
