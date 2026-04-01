import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LettreSyntheseClient from '@/components/lettre-synthese/LettreSyntheseClient'

export const dynamic = 'force-dynamic'

export default async function LettreSynthesePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const [{ data: profile }, { data: project }] = await Promise.all([
    supabase.from('profiles').select('first_name, last_name').eq('id', user.id).single(),
    supabase
      .from('projects')
      .select('id, name, goal_amount')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
  ])

  if (!project) redirect('/onboarding')

  const { data: members } = await supabase
    .from('family_members')
    .select('id, first_name, last_name, amount, contribution_type, status')
    .eq('project_id', project.id)
    .not('amount', 'is', null)
    .order('first_name')

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <LettreSyntheseClient
        ownerFirstName={profile?.first_name ?? ''}
        ownerLastName={profile?.last_name ?? ''}
        projectName={project.name ?? ''}
        goalAmount={project.goal_amount ? String(project.goal_amount) : ''}
        initialMembers={(members ?? []).map(m => ({
          id:            m.id,
          firstName:     m.first_name     ?? '',
          lastName:      m.last_name      ?? '',
          type:          (m.contribution_type ?? 'pret') as 'pret' | 'don' | 'investissement',
          amount:        m.amount != null ? String(m.amount) : '',
          status:        (m.status === 'signe' ? 'signe' : 'en_attente') as 'signe' | 'en_attente',
        }))}
      />
    </div>
  )
}
