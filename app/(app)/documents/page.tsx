import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DocumentList from '@/components/documents/DocumentList'

export const dynamic = 'force-dynamic'

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: project } = await supabase
    .from('projects')
    .select('id, name')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!project) redirect('/onboarding')

  const [{ data: rawDocs }, { data: members }] = await Promise.all([
    supabase
      .from('documents')
      .select(`
        id, type, amount, duration_months, interest_rate, status,
        lender_signed_at, borrower_signed_at, created_at,
        family_members(first_name, last_name)
      `)
      .eq('project_id', project.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('family_members')
      .select('id, first_name, last_name, contribution_type, status')
      .eq('project_id', project.id)
      .order('first_name'),
  ])

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <DocumentList
        documents={rawDocs ?? []}
        members={members ?? []}
        projectId={project.id}
      />
    </div>
  )
}
