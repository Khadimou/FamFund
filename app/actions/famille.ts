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

  const { error } = await supabase.from('family_members').insert({
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
  })

  if (error) return { error: error.message }
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

  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) return { error: 'Service email non configuré.' }

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: 'FamilyFund', email: 'noreply@familyfund.fr' },
      to: [{ email: member.email, name: `${member.first_name} ${member.last_name}` }],
      subject: `Rappel : votre contribution au projet « ${project?.name ?? ''} »`,
      htmlContent: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
          <p style="font-size:20px;font-weight:600;color:#1C3B2E;margin-bottom:8px">Rappel de contribution</p>
          <p style="color:#555;line-height:1.6">
            Bonjour ${member.first_name},<br/><br/>
            Nous vous rappelons que vous avez été invité(e) à contribuer au projet
            <strong>${project?.name ?? ''}</strong>. N'hésitez pas à nous faire part de votre intention.
          </p>
          <p style="color:#aaa;font-size:12px;margin-top:24px">Envoyé via FamilyFund.</p>
        </div>`,
    }),
  })

  if (!res.ok) return { error: "Échec de l'envoi de l'email." }
  return { success: true }
}
