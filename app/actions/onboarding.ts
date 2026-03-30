'use server'

import { createClient } from '@/lib/supabase/server'

interface ProjectPayload {
  firstName: string
  lastName: string
  projectName: string
  category: string
  location: string
  description: string
  goalAmount: number
  minimumAmount: number
  durationMonths: number
  interestRate: number
}

export async function createProject(payload: ProjectPayload) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Non authentifié.' }

  // Mise à jour du profil
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ first_name: payload.firstName, last_name: payload.lastName })
    .eq('id', user.id)

  if (profileError) return { error: profileError.message }

  // Création du projet
  const { error: projectError } = await supabase.from('projects').insert({
    owner_id: user.id,
    name: payload.projectName,
    category: payload.category,
    location: payload.location,
    description: payload.description,
    goal_amount: payload.goalAmount,
    minimum_amount: payload.minimumAmount,
    duration_months: payload.durationMonths,
    interest_rate: payload.interestRate,
  })

  if (projectError) return { error: projectError.message }

  return { success: true }
}
