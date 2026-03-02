import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
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

    return NextResponse.json({ success: true, position: count ?? 1 }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Service temporairement indisponible. Réessayez dans quelques instants.' },
      { status: 503 },
    )
  }
}
