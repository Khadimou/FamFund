'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleReminders(projectId: string, enabled: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }

  const { error } = await supabase
    .from('projects')
    .update({ reminders_enabled: enabled })
    .eq('id', projectId)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/remboursements')
  return { success: true }
}
