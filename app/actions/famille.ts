'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface MemberPayload {
  projectId: string
  firstName: string
  lastName: string
  relation: string
  email: string
  phone: string
  amount: string
  contributionType: string
  availability: string
}

export async function addMember(payload: MemberPayload) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }

  const { data: member, error } = await supabase.from('family_members').insert({
    project_id:        payload.projectId,
    first_name:        payload.firstName,
    last_name:         payload.lastName,
    relation:          payload.relation        || null,
    email:             payload.email           || null,
    phone:             payload.phone           || null,
    amount:            payload.amount ? parseFloat(payload.amount) : null,
    contribution_type: payload.contributionType || null,
    availability:      payload.availability    || 'non_renseigne',
    status:            'invite',
  }).select('id').single()

  if (error) return { error: error.message }

  // Envoi de l'invitation si un email est renseigné
  if (payload.email && member) {
    const { data: project } = await supabase
      .from('projects')
      .select('name')
      .eq('id', payload.projectId)
      .single()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://familyfund.fr'
    const inviteLink = `${appUrl}/invitation/${member.id}`
    const apiKey = process.env.BREVO_API_KEY

    if (!apiKey) {
      revalidatePath('/famille')
      return { success: true, emailWarning: 'BREVO_API_KEY non configuré — email non envoyé.' }
    }

    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'FamilyFund', email: 'noreply@familyfund.fr' },
        to: [{ email: payload.email, name: `${payload.firstName} ${payload.lastName}` }],
        subject: `${payload.firstName}, vous êtes invité(e) à contribuer au projet « ${project?.name ?? ''} »`,
        htmlContent: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px">
            <p style="font-size:22px;font-weight:600;color:#1C3B2E;margin-bottom:8px">
              Vous avez été invité(e) à contribuer
            </p>
            <p style="color:#555;line-height:1.7;margin-bottom:24px">
              Bonjour ${payload.firstName},<br/><br/>
              Vous avez été invité(e) à participer au projet <strong>${project?.name ?? ''}</strong>
              sur FamilyFund. En quelques clics, indiquez si vous souhaitez contribuer et à quelle hauteur.
              Vos informations resteront entièrement confidentielles.
            </p>
            <a href="${inviteLink}"
              style="display:inline-block;background:#2D6A4F;color:#fff;padding:14px 28px;
                     border-radius:10px;text-decoration:none;font-weight:600;font-size:15px">
              Renseigner ma contribution →
            </a>
            <p style="color:#aaa;font-size:12px;margin-top:28px">
              Si vous ne souhaitez pas participer, ignorez simplement cet email.
            </p>
          </div>`,
      }),
    })

    if (!brevoRes.ok) {
      const body = await brevoRes.json().catch(() => ({}))
      console.error('Brevo invitation error:', brevoRes.status, JSON.stringify(body))
      revalidatePath('/famille')
      return { success: true, emailWarning: `Membre ajouté mais l'email n'a pas pu être envoyé (${body.message ?? brevoRes.status}).` }
    }
  }

  revalidatePath('/famille')
  return { success: true }
}

export async function updateMember(memberId: string, payload: Omit<MemberPayload, 'projectId'>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }

  const { error } = await supabase.from('family_members').update({
    first_name:        payload.firstName,
    last_name:         payload.lastName,
    relation:          payload.relation        || null,
    email:             payload.email           || null,
    phone:             payload.phone           || null,
    amount:            payload.amount ? parseFloat(payload.amount) : null,
    contribution_type: payload.contributionType || null,
    availability:      payload.availability    || 'non_renseigne',
  }).eq('id', memberId)

  if (error) return { error: error.message }
  revalidatePath('/famille')
  return { success: true }
}

export async function deleteMember(memberId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }

  const { error } = await supabase.from('family_members').delete().eq('id', memberId)
  if (error) return { error: error.message }
  revalidatePath('/famille')
  return { success: true }
}

export async function resendInvitation(memberId: string) {
  const supabase = await createClient()

  const { data: member } = await supabase
    .from('family_members')
    .select('email, first_name, last_name, project_id')
    .eq('id', memberId)
    .single()

  if (!member?.email) return { error: "Ce membre n'a pas d'adresse email." }

  const { data: project } = await supabase
    .from('projects')
    .select('name')
    .eq('id', member.project_id)
    .single()

  const apiKey    = process.env.BREVO_API_KEY
  if (!apiKey) return { error: 'Service email non configuré.' }

  const appUrl     = process.env.NEXT_PUBLIC_APP_URL ?? 'https://familyfund.fr'
  const inviteLink = `${appUrl}/invitation/${memberId}`

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: 'FamilyFund', email: 'noreply@familyfund.fr' },
      to: [{ email: member.email, name: `${member.first_name} ${member.last_name}` }],
      subject: `Rappel : votre contribution au projet « ${project?.name ?? ''} »`,
      htmlContent: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px">
          <p style="font-size:20px;font-weight:600;color:#1C3B2E;margin-bottom:8px">Rappel de contribution</p>
          <p style="color:#555;line-height:1.7;margin-bottom:24px">
            Bonjour ${member.first_name},<br/><br/>
            Nous vous rappelons que vous avez été invité(e) à contribuer au projet
            <strong>${project?.name ?? ''}</strong>. Cliquez sur le bouton ci-dessous pour indiquer
            votre intention en quelques secondes.
          </p>
          <a href="${inviteLink}"
            style="display:inline-block;background:#2D6A4F;color:#fff;padding:14px 28px;
                   border-radius:10px;text-decoration:none;font-weight:600;font-size:15px">
            Renseigner ma contribution →
          </a>
          <p style="color:#aaa;font-size:12px;margin-top:28px">
            Si vous ne souhaitez pas participer, ignorez simplement cet email.
          </p>
        </div>`,
    }),
  })

  if (!res.ok) return { error: "Échec de l'envoi de l'email." }
  return { success: true }
}
