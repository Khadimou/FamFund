'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export interface ProfilFinancierPayload {
  minAmount:             number | null
  maxAmount:             number | null
  availability:          string
  paymentMethod:         string
  paymentDuration:       string
  loanRepaymentDuration: string
  repaymentFrequency:    string
  amountVisibility:      'private' | 'shared'
}

export async function saveProfilFinancier(memberId: string, payload: ProfilFinancierPayload) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('family_members')
    .update({
      min_amount:               payload.minAmount,
      max_amount:               payload.maxAmount,
      availability:             payload.availability            || 'non_renseigne',
      payment_method:           payload.paymentMethod           || null,
      payment_duration:         payload.paymentDuration         || null,
      loan_repayment_duration:  payload.loanRepaymentDuration   || null,
      repayment_frequency:      payload.repaymentFrequency      || null,
      amount_visibility:        payload.amountVisibility,
      status:                   'a_repondu',
    })
    .eq('id', memberId)

  if (error) return { error: error.message }
  return { success: true }
}
