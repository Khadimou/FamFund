import { apiGet, ApiError } from '@/lib/api'
import PledgeForm from '@/components/app/PledgeForm'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface InviteInfo {
  token: string
  group_name: string
  invited_name: string
  goal_amount: number
  currency: string
  expired: boolean
  already_used: boolean
}

export default async function InvitePage({ params }: { params: { token: string } }) {
  let invite: InviteInfo

  try {
    invite = await apiGet<InviteInfo>(`/invite/${params.token}`)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  if (invite.expired) {
    return <InviteError message="Ce lien d'invitation a expiré. Demandez un nouveau lien au porteur du projet." />
  }

  if (invite.already_used) {
    return (
      <InviteError
        message="Vous avez déjà répondu à cette invitation."
        cta={<Link href="/dashboard" className="text-primary underline">Accéder à votre espace</Link>}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-2xl text-primary font-bold">
            FamilyFund
          </Link>
        </div>

        {/* Carte principale */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Bandeau invitation */}
          <div className="bg-primary/5 border-b border-primary/10 px-8 py-6">
            <p className="text-sm text-muted mb-1">Vous êtes invité(e) à participer à</p>
            <h1 className="font-serif text-2xl text-text font-bold">{invite.group_name}</h1>
            <p className="text-sm text-muted mt-2">
              Objectif :{' '}
              <strong className="text-text">
                {invite.goal_amount.toLocaleString('fr-FR')} {invite.currency}
              </strong>
            </p>
          </div>

          {/* Formulaire */}
          <div className="px-8 py-8">
            <p className="text-muted text-sm mb-6">
              Renseignez ce que vous pouvez apporter. Ces informations restent{' '}
              <strong>strictement privées</strong> — seul le porteur du projet voit le total.
            </p>
            <PledgeForm invite={invite} />
          </div>
        </div>

        {/* Mention légale */}
        <p className="text-center text-xs text-muted mt-6">
          En confirmant, vous n'êtes engagé(e) que moralement. La signature du contrat se fait hors plateforme.
        </p>
      </div>
    </div>
  )
}

function InviteError({ message, cta }: { message: string; cta?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <p className="text-4xl mb-4">🔒</p>
        <h1 className="font-serif text-xl text-text mb-3">Lien invalide</h1>
        <p className="text-muted text-sm mb-4">{message}</p>
        {cta}
      </div>
    </div>
  )
}
