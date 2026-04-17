'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type DocumentType = 'loan_agreement' | 'gift_declaration' | 'term_sheet'

/** Calcule la mensualité (annuité constante). */
function monthlyInstallment(amount: number, durationMonths: number, annualRatePct: number): number {
  if (annualRatePct <= 0) return amount / durationMonths
  const r = annualRatePct / 100 / 12
  return (amount * r * Math.pow(1 + r, durationMonths)) / (Math.pow(1 + r, durationMonths) - 1)
}

/** Génère les dates d'échéances mensuelles à partir du mois prochain. */
function buildScheduleDates(durationMonths: number): string[] {
  const dates: string[] = []
  const now = new Date()
  for (let i = 1; i <= durationMonths; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

export async function generateDocument(
  projectId:      string,
  memberId:       string,
  type:           DocumentType,
  amount:         number,
  durationMonths: number | null = null,
  interestRate:   number        = 0,
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }

  const { data: doc, error } = await supabase
    .from('documents')
    .insert({
      project_id:      projectId,
      member_id:       memberId,
      type,
      amount,
      duration_months: durationMonths,
      interest_rate:   interestRate,
      status:          'draft',
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  // Génère les échéances uniquement pour les contrats de prêt avec une durée définie
  if (type === 'loan_agreement' && durationMonths && durationMonths > 0) {
    const monthly = monthlyInstallment(amount, durationMonths, interestRate)
    const dates   = buildScheduleDates(durationMonths)

    // Supprime les éventuelles échéances précédentes pour ce membre
    await supabase
      .from('repayments')
      .delete()
      .eq('project_id', projectId)
      .eq('member_id', memberId)

    const rows = dates.map(due_date => ({
      project_id: projectId,
      member_id:  memberId,
      amount:     Math.round(monthly * 100) / 100,
      due_date,
      status:     'a_venir',
    }))

    await supabase.from('repayments').insert(rows)
  }

  revalidatePath('/documents')
  revalidatePath('/remboursements')
  redirect(`/documents/${doc.id}`)
}
