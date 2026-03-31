import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import FamilleClient from '@/components/famille/FamilleClient'

export const dynamic = 'force-dynamic'

export default async function FamillePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!project) redirect('/onboarding')

  const { data: members } = await supabase
    .from('family_members')
    .select('id, first_name, last_name, relation, email, phone, amount, contribution_type, availability, status')
    .eq('project_id', project.id)
    .order('created_at')

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <FamilleClient
        members={members ?? []}
        projectId={project.id}
      />
    </div>
  )
}
