'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type DocumentType = 'loan_agreement' | 'gift_declaration' | 'term_sheet'

export async function generateDocument(
  projectId: string,
  memberId:  string,
  type:      DocumentType,
  amount:    number,
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }

  // Récupère la durée depuis le projet du porteur
  const { data: project } = await supabase
    .from('projects')
    .select('duration_months, interest_rate')
    .eq('id', projectId)
    .single()

  const { data: doc, error } = await supabase
    .from('documents')
    .insert({
      project_id:      projectId,
      member_id:       memberId,
      type,
      amount,
      duration_months: project?.duration_months ?? null,
      interest_rate:   project?.interest_rate   ?? 0,
      status:          'draft',
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/documents')
  redirect(`/documents/${doc.id}`)
}
