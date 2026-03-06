import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const apiKey = process.env.BREVO_API_KEY
  const pdfPath = process.env.GUIDE_PDF_PATH
  const listId = process.env.BREVO_GUIDE_LIST_ID ? Number(process.env.BREVO_GUIDE_LIST_ID) : null

  if (!apiKey) {
    return NextResponse.json({ error: 'Service non configuré.' }, { status: 503 })
  }

  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email requis.' }, { status: 400 })
    }

    // ── Supabase : inscrire l'email si nouveau ─────────────────────────────
    const supabase = getSupabase()
    if (supabase) {
      const { data: existing } = await supabase
        .from('waitlist')
        .select('id')
        .eq('email', email)
        .single()

      if (!existing) {
        await supabase.from('waitlist').insert({ email, source: 'guide' })
      }
    }

    // ── Supabase Storage : URL signée 7 jours ──────────────────────────────
    let downloadUrl = ''
    if (supabase && pdfPath) {
      const { data } = await supabase.storage
        .from('guides')
        .createSignedUrl(pdfPath, 60 * 60 * 24 * 7)
      downloadUrl = data?.signedUrl ?? ''
    }

    if (!downloadUrl) {
      return NextResponse.json({ error: 'Guide temporairement indisponible.' }, { status: 503 })
    }

    // ── Brevo : email transactionnel J+0 (livraison du guide) ──────────────
    const emailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'FamilyFund', email: 'contact@familyfund.fr' },
        to: [{ email }],
        subject: 'Votre guide Love Money est prêt 📥',
        htmlContent: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a2e1e">
            <h2 style="color:#2d6a4f">Votre guide est prêt !</h2>
            <p>Merci pour votre intérêt. Voici votre accès au guide :</p>
            <p style="text-align:center;margin:32px 0">
              <a href="${downloadUrl}"
                 style="background:#2d6a4f;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;display:inline-block">
                Télécharger le guide
              </a>
            </p>
            <p style="color:#666;font-size:13px">Ce lien est valable 7 jours. Après expiration, remplissez à nouveau le formulaire pour en obtenir un nouveau.</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
            <p style="color:#999;font-size:12px">
              FamilyFund · <a href="https://familyfund.fr" style="color:#2d6a4f">familyfund.fr</a>
            </p>
          </div>
        `,
      }),
    })

    if (!emailRes.ok) {
      const err = await emailRes.json()
      console.error('Brevo email error:', JSON.stringify(err))
      return NextResponse.json({ error: err.message ?? 'Envoi impossible. Réessayez.' }, { status: 500 })
    }

    // ── Brevo : ajout du contact dans la liste → déclenche l'automation ────
    // Ne bloque pas la réponse si cette étape échoue
    if (listId) {
      fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          attributes: {
            GUIDE_DOWNLOAD_DATE: new Date().toISOString().split('T')[0],
          },
          listIds: [listId],
          updateEnabled: true,
        }),
      }).catch((err) => console.error('Brevo contact error:', err))
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Service temporairement indisponible. Réessayez dans quelques instants.' },
      { status: 503 },
    )
  }
}
