'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

interface Props {
  supabaseUrl: string
  supabaseAnonKey: string
}

export default function CallbackHandler({ supabaseUrl, supabaseAnonKey }: Props) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

    async function handle() {
      // Flow implicite — tokens dans le hash
      const hash = window.location.hash
      if (hash) {
        const params = new URLSearchParams(hash.slice(1))
        const accessToken  = params.get('access_token')
        const refreshToken = params.get('refresh_token')

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token:  accessToken,
            refresh_token: refreshToken,
          })
          if (error) { router.replace('/?error=auth_failed'); return }
          await redirect(supabase)
          return
        }
      }

      // Flow PKCE — code dans les query params
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) { router.replace('/?error=auth_failed'); return }
        await redirect(supabase)
        return
      }

      router.replace('/?error=auth_failed')
    }

    async function redirect(supabase: ReturnType<typeof createBrowserClient>) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/?error=auth_failed'); return }

      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1)
        .single()

      router.replace(project ? '/dashboard' : '/onboarding')
    }

    handle()
  }, [supabaseUrl, supabaseAnonKey, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F0E8]">
      <p className="text-muted text-sm">Connexion en cours…</p>
    </div>
  )
}
