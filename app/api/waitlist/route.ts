import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Service non configuré.' }, { status: 503 })
  }

  const brevoApiKey = process.env.BREVO_API_KEY
  const brevoListId = process.env.BREVO_WAITLIST_LIST_ID ? Number(process.env.BREVO_WAITLIST_LIST_ID) : null

  try {
    const { email, source } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email requis.' }, { status: 400 })
    }

    // Vérifie si l'email est déjà inscrit
    const { data: existing } = await supabase
      .from('waitlist')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      const { count } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .lte('id', existing.id)

      return NextResponse.json({ success: true, position: count ?? 1 })
    }

    // Nouvel inscrit
    const { data, error } = await supabase
      .from('waitlist')
      .insert({ email, source: source ?? 'unknown' })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Inscription impossible. Réessayez.' }, { status: 500 })
    }

    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .lte('id', data.id)

    // Brevo : ajout du contact dans la liste → déclenche l'automation
    if (brevoApiKey && brevoListId) {
      const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: { 'api-key': brevoApiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          attributes: {
            WAITLIST_SIGNUP_DATE: new Date().toISOString().split('T')[0],
            SOURCE: source ?? 'unknown',
          },
          listIds: [brevoListId],
          updateEnabled: true,
        }),
      })
      const brevoBody = await brevoRes.json().catch(() => null)
      console.log('Brevo status:', brevoRes.status, JSON.stringify(brevoBody))
    } else {
      console.log('Brevo skipped — apiKey:', !!brevoApiKey, 'listId:', brevoListId)
    }

    return NextResponse.json({ success: true, position: count ?? 1 }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Service temporairement indisponible. Réessayez dans quelques instants.' },
      { status: 503 },
    )
  }
}
