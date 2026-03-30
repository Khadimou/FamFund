import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code       = searchParams.get('code')
  const tokenHash  = searchParams.get('token_hash')
  const type       = searchParams.get('type') as EmailOtpType | null

  const supabase = await createClient()
  let userId: string | null = null

  if (code) {
    // Flow PKCE — code échangé contre une session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error || !data.user) {
      return NextResponse.redirect(`${origin}/?error=auth_failed`)
    }
    userId = data.user.id
  } else if (tokenHash && type) {
    // Flow OTP — vérification directe du token
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (error || !data.user) {
      return NextResponse.redirect(`${origin}/?error=auth_failed`)
    }
    userId = data.user.id
  } else {
    return NextResponse.redirect(`${origin}/?error=auth_failed`)
  }

  // Récupération de l'email depuis la session active
  const { data: { user } } = await supabase.auth.getUser()

  // Upsert du profil
  await supabase
    .from('profiles')
    .upsert({ id: userId, email: user?.email }, { onConflict: 'id', ignoreDuplicates: true })

  // Vérification de l'existence d'un projet
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('owner_id', userId)
    .limit(1)
    .single()

  const destination = project ? '/dashboard' : '/onboarding'
  return NextResponse.redirect(`${origin}${destination}`)
}
