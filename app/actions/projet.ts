'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ProjectUpdatePayload {
  name:           string
  category:       string
  location:       string
  description:    string
  goalAmount:     number | null
  minimumAmount:  number | null
  durationMonths: number | null
  interestRate:   number | null
  startDate:      string | null
}

export async function updateProject(projectId: string, payload: ProjectUpdatePayload) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }

  const { error } = await supabase
    .from('projects')
    .update({
      name:            payload.name,
      category:        payload.category       || null,
      location:        payload.location       || null,
      description:     payload.description    || null,
      goal_amount:     payload.goalAmount,
      minimum_amount:  payload.minimumAmount,
      duration_months: payload.durationMonths,
      interest_rate:   payload.interestRate,
      start_date:      payload.startDate      || null,
    })
    .eq('id', projectId)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/projet')
  revalidatePath('/dashboard')
  return { success: true }
}
