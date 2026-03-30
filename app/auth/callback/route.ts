import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=auth_failed`)
  }

  const supabase = await createClient()

  const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)
  if (sessionError || !sessionData.user) {
    return NextResponse.redirect(`${origin}/?error=auth_failed`)
  }

  const user = sessionData.user

  // Upsert du profil (sécurité si le trigger SQL n'a pas encore tourné)
  await supabase
    .from('profiles')
    .upsert({ id: user.id, email: user.email }, { onConflict: 'id', ignoreDuplicates: true })

  // Vérification de l'existence d'un projet
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .single()

  const destination = project ? '/dashboard' : '/onboarding'
  return NextResponse.redirect(`${origin}${destination}`)
}
