import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  createSignatureRequest,
  uploadDocument,
  addSigner,
  activateSignatureRequest,
} from '@/lib/yousign'
import { generateContractPdf } from '@/lib/generateContractPdf'

const DOC_LABELS: Record<string, string> = {
  loan_agreement:   'Contrat de pret familial',
  gift_declaration: 'Declaration de don',
  term_sheet:       'Lettre de conditions',
}

function calcMensualite(amount: number, months: number, rate: number): number {
  if (months <= 0) return 0
  if (rate === 0)  return amount / months
  const r = rate / 100 / 12
  return (amount * r) / (1 - Math.pow(1 + r, -months))
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { documentId } = await req.json().catch(() => ({}))
  if (!documentId) return NextResponse.json({ error: 'documentId manquant' }, { status: 400 })

  /* ── Fetch document ── */
  const { data: doc } = await supabase
    .from('documents')
    .select(`
      id, type, amount, duration_months, interest_rate, status, yousign_request_id, project_id,
      family_members(id, first_name, last_name, email)
    `)
    .eq('id', documentId)
    .single()

  if (!doc) return NextResponse.json({ error: 'Document introuvable' }, { status: 404 })
  if (doc.yousign_request_id) return NextResponse.json({ error: 'Signature déjà initiée' }, { status: 400 })

  /* ── Vérification plan ── */
  const { data: project } = await supabase
    .from('projects')
    .select('id, name, plan')
    .eq('id', doc.project_id)
    .eq('owner_id', user.id)
    .single()

  if (!project) return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 })
  if (project.plan !== 'en_famille' && project.plan !== 'avec_avocat') {
    return NextResponse.json({ error: 'Plan En Famille requis pour la signature.' }, { status: 403 })
  }

  /* ── Parties ── */
  const member = Array.isArray(doc.family_members) ? doc.family_members[0] : doc.family_members
  if (!member?.email) {
    return NextResponse.json({ error: "L'email du prêteur est manquant." }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single()

  const memberName = [member.first_name, member.last_name].filter(Boolean).join(' ') || 'Preteur'
  const ownerName  = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Emprunteur'

  const amount   = doc.amount          ?? 0
  const months   = doc.duration_months ?? 0
  const rate     = doc.interest_rate   ?? 0
  const mensualite = amount > 0 && months > 0 ? calcMensualite(amount, months, rate) : null

  /* ── Génération PDF ── */
  const pdfBuffer = await generateContractPdf({
    typeLabel:      DOC_LABELS[doc.type] ?? doc.type,
    memberName,
    ownerName,
    projectName:    project.name,
    amount,
    durationMonths: months,
    interestRate:   rate,
    mensualite,
    createdAt: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
  })

  /* ── Flux Yousign ── */
  const srName = `${DOC_LABELS[doc.type] ?? 'Contrat'} — ${memberName} → ${ownerName}`
  const sr = await createSignatureRequest(srName)

  const ysDoc = await uploadDocument(sr.id, pdfBuffer, `contrat_${doc.id}.pdf`)

  // Prêteur signe à gauche (x=75, y=650)
  await addSigner(sr.id, ysDoc.id, {
    first_name: member.first_name ?? 'Prenom',
    last_name:  member.last_name  ?? 'Nom',
    email:      member.email,
  }, 75, 650)

  // Emprunteur signe à droite (x=350, y=650)
  await addSigner(sr.id, ysDoc.id, {
    first_name: profile?.first_name ?? 'Prenom',
    last_name:  profile?.last_name  ?? 'Nom',
    email:      user.email!,
  }, 350, 650)

  await activateSignatureRequest(sr.id)

  /* ── Mise à jour Supabase ── */
  const admin = createAdminClient()
  await admin
    .from('documents')
    .update({
      yousign_request_id:  sr.id,
      yousign_document_id: ysDoc.id,
      status:              'pending_signature',
    })
    .eq('id', doc.id)

  console.log(`✅ Signature initiée — request ${sr.id} — doc ${doc.id}`)
  return NextResponse.json({ success: true, signatureRequestId: sr.id })
}
