'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type DocumentType = 'loan_agreement' | 'gift_declaration' | 'term_sheet'

export async function generateDocument(projectId: string, memberId: string, type: DocumentType) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }

  // Récupère les données du membre pour pré-remplir
  const { data: member } = await supabase
    .from('family_members')
    .select('amount, duration_months, contribution_type')
    .eq('id', memberId)
    .single()

  const { data: doc, error } = await supabase
    .from('documents')
    .insert({
      project_id:      projectId,
      member_id:       memberId,
      type,
      amount:          member?.amount          ?? null,
      duration_months: member?.duration_months ?? null,
      interest_rate:   0,
      status:          'draft',
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/documents')
  redirect(`/documents/${doc.id}`)
}
