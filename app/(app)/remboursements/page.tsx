import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RemboursementsClient from '@/components/remboursements/RemboursementsClient'

export const dynamic = 'force-dynamic'

export default async function RemboursementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: project } = await supabase
    .from('projects')
    .select('id, name, goal_amount, reminders_enabled')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!project) redirect('/onboarding')

  const { data: rawRepayments } = await supabase
    .from('repayments')
    .select('id, amount, due_date, status, family_members(first_name, last_name)')
    .eq('project_id', project.id)
    .order('due_date', { ascending: true })

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <RemboursementsClient
        project={{
          id:                project.id,
          name:              project.name,
          goal_amount:       project.goal_amount,
          reminders_enabled: project.reminders_enabled ?? true,
        }}
        repayments={(rawRepayments ?? []) as any}
      />
    </div>
  )
}
