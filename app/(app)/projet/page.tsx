import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProjetClient from '@/components/projet/ProjetClient'

export const dynamic = 'force-dynamic'

export default async function ProjetPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!project) redirect('/onboarding')

  const { count: membersCount } = await supabase
    .from('family_members')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', project.id)

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <ProjetClient
        project={project}
        membersCount={membersCount ?? 0}
      />
    </div>
  )
}
