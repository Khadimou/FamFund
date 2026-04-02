import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DocumentDetail from '@/components/documents/DocumentDetail'

export const dynamic = 'force-dynamic'

export default async function DocumentDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: doc } = await supabase
    .from('documents')
    .select(`
      id, type, amount, duration_months, interest_rate, status,
      lender_signed_at, borrower_signed_at, created_at, project_id,
      yousign_request_id,
      family_members(id, first_name, last_name, email)
    `)
    .eq('id', params.id)
    .single()

  if (!doc) notFound()

  // Vérifie que ce document appartient bien au projet de l'utilisateur
  const { data: project } = await supabase
    .from('projects')
    .select('id, name, goal_amount, plan')
    .eq('id', doc.project_id)
    .eq('owner_id', user.id)
    .single()

  if (!project) notFound()

  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single()

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <DocumentDetail
        doc={doc as any}
        project={project}
        ownerProfile={ownerProfile ?? { first_name: null, last_name: null }}
        plan={project.plan ?? 'gratuit'}
      />
    </div>
  )
}
