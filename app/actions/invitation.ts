'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function submitContribution(
  memberId: string,
  payload: {
    amount: string
    contributionType: string
    availability: string
  },
) {
  // Admin client — la page d'invitation est publique, pas de session utilisateur
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('family_members')
    .update({
      amount:            payload.amount ? parseFloat(payload.amount) : null,
      contribution_type: payload.contributionType || null,
      availability:      payload.availability     || 'non_renseigne',
      status:            'a_repondu',
    })
    .eq('id', memberId)

  if (error) return { error: error.message }
  return { success: true }
}
