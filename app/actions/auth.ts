'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function sendMagicLink(email: string, redirectTo: string) {
  // Admin client (service role) pour générer le lien sans envoyer d'email Supabase
  const admin = createAdminClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo },
  })

  if (error || !data.properties?.action_link) {
    return { error: error?.message ?? 'Impossible de générer le lien.' }
  }

  const magicLink = data.properties.action_link

  // Envoi via Brevo
  const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender:  { name: 'FamilyFund', email: 'noreply@familyfund.fr' },
      to:      [{ email }],
      subject: 'Votre lien de connexion FamilyFund',
      htmlContent: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
          <p style="font-size:22px;font-weight:600;color:#1C3B2E;margin-bottom:8px">
            Connexion à FamilyFund
          </p>
          <p style="color:#555;margin-bottom:24px">
            Cliquez sur le bouton ci-dessous pour vous connecter. Ce lien expire dans 1 heure.
          </p>
          <a href="${magicLink}"
             style="display:inline-block;background:#2D6A4F;color:#fff;padding:14px 28px;
                    border-radius:10px;text-decoration:none;font-weight:600;font-size:15px">
            Se connecter →
          </a>
          <p style="color:#aaa;font-size:12px;margin-top:24px">
            Si vous n'avez pas demandé ce lien, ignorez cet email.
          </p>
        </div>
      `,
    }),
  })

  if (!brevoRes.ok) {
    const err = await brevoRes.json().catch(() => null)
    return { error: err?.message ?? "Échec de l'envoi de l'email." }
  }

  return { success: true }
}
