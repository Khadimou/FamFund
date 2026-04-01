import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import ProfilFinancierForm from './ProfilFinancierForm'

export default async function ProfilFinancierPage({
  searchParams,
}: {
  searchParams: { token?: string }
}) {
  const memberId = searchParams.token
  if (!memberId) notFound()

  const supabase = createAdminClient()

  const { data: member } = await supabase
    .from('family_members')
    .select(`
      id, first_name, last_name, status, project_id,
      min_amount, max_amount, availability,
      payment_method, payment_duration,
      loan_repayment_duration, repayment_frequency, amount_visibility
    `)
    .eq('id', memberId)
    .single()

  if (!member) notFound()

  const { data: project } = await supabase
    .from('projects')
    .select('name, user_id')
    .eq('id', member.project_id)
    .single()

  if (!project) notFound()

  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', project.user_id)
    .single()

  const ownerFirstName = ownerProfile?.first_name ?? 'le porteur'
  const ownerInitials  = [ownerProfile?.first_name, ownerProfile?.last_name]
    .filter(Boolean)
    .map(n => n![0].toUpperCase())
    .join('') || '?'

  return (
    <main className="min-h-screen bg-[#F5F0E8]">
      {/* Bandeau sombre */}
      <div className="bg-[#1C3B2E] text-white">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-white/60 hover:text-white text-sm transition-colors"
          >
            ← Accueil
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#40916C] flex items-center justify-center font-bold text-sm shrink-0">
              {ownerInitials}
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs">Projet de {ownerFirstName}</p>
              <p className="font-semibold text-sm">{project.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-2xl mx-auto px-4 py-10">
        <ProfilFinancierForm
          memberId={member.id}
          ownerFirstName={ownerFirstName}
          defaultValues={{
            minAmount:             member.min_amount              ?? null,
            maxAmount:             member.max_amount              ?? null,
            availability:          member.availability            ?? '',
            paymentMethod:         member.payment_method          ?? '',
            paymentDuration:       member.payment_duration        ?? '',
            loanRepaymentDuration: member.loan_repayment_duration ?? '',
            repaymentFrequency:    member.repayment_frequency     ?? '',
            amountVisibility:      (member.amount_visibility as 'private' | 'shared') ?? 'private',
          }}
        />
      </div>
    </main>
  )
}
