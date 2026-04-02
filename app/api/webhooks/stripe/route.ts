import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import type Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sig     = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Signature manquante.' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature invalide:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  const supabase = createAdminClient()

  switch (event.type) {

    /* ── Paiement réussi ── */
    case 'checkout.session.completed': {
      const session   = event.data.object as Stripe.Checkout.Session
      const { projectId, userId, plan } = session.metadata ?? {}
      if (!projectId || !plan) break

      const updates: Record<string, unknown> = { plan }

      // Stocker l'ID client Stripe pour les prochains checkouts
      if (session.customer) {
        updates.stripe_customer_id = session.customer as string
      }
      // Stocker l'ID abonnement pour le plan En Famille
      if (session.subscription) {
        updates.stripe_subscription_id = session.subscription as string
      }

      await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)

      console.log(`✅ Plan "${plan}" activé pour le projet ${projectId}`)
      break
    }

    /* ── Abonnement résilié ── */
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const projectId    = subscription.metadata?.projectId

      if (projectId) {
        await supabase
          .from('projects')
          .update({ plan: 'gratuit', stripe_subscription_id: null })
          .eq('id', projectId)

        console.log(`↩️ Projet ${projectId} rétrogradé vers le plan gratuit`)
      } else {
        // Fallback : chercher par stripe_subscription_id
        await supabase
          .from('projects')
          .update({ plan: 'gratuit', stripe_subscription_id: null })
          .eq('stripe_subscription_id', subscription.id)
      }
      break
    }

    /* ── Paiement échoué ── */
    case 'invoice.payment_failed': {
      const invoice   = event.data.object as Stripe.Invoice
      const subId     = (invoice as any).subscription as string | null
      console.warn(`⚠️ Paiement échoué pour l'abonnement ${subId} — client ${invoice.customer}`)
      // TODO : envoyer un email de notification via Brevo
      break
    }

    default:
      // Ignorer les autres événements
      break
  }

  return NextResponse.json({ received: true })
}
