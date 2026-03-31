import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import InvitationForm from './InvitationForm'

interface Props {
  params: { id: string }
}

export default async function InvitationPage({ params }: Props) {
  const supabase = createAdminClient()

  const { data: member } = await supabase
    .from('family_members')
    .select('id, first_name, last_name, status, project_id')
    .eq('id', params.id)
    .single()

  if (!member) notFound()

  const { data: project } = await supabase
    .from('projects')
    .select('name')
    .eq('id', member.project_id)
    .single()

  const memberName  = [member.first_name, member.last_name].filter(Boolean).join(' ')
  const projectName = project?.name ?? 'ce projet'
  const alreadyDone = member.status !== 'invite'

  return (
    <main className="min-h-screen bg-[#F5F0E8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">
            F
          </div>
          <span className="font-serif text-lg text-[#1C3B2E] font-semibold">FamilyFund</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {alreadyDone ? (
            <div className="text-center py-6">
              <p className="text-3xl mb-3">✅</p>
              <p className="font-semibold text-text">Vous avez déjà répondu</p>
              <p className="text-muted text-sm mt-2">Votre contribution a déjà été enregistrée. Merci !</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="font-serif text-2xl text-[#1C3B2E] mb-1">
                  Bonjour {member.first_name} 👋
                </h1>
                <p className="text-muted text-sm">
                  Vous avez été invité(e) à contribuer au projet{' '}
                  <span className="font-medium text-text">« {projectName} »</span>.
                  Indiquez simplement votre intention — sans engagement définitif.
                </p>
              </div>

              <InvitationForm
                memberId={params.id}
                memberName={memberName}
                projectName={projectName}
              />
            </>
          )}
        </div>

        <p className="text-center text-xs text-muted mt-6">
          Propulsé par <span className="font-medium">FamilyFund</span> · Le notaire du love money
        </p>
      </div>
    </main>
  )
}
