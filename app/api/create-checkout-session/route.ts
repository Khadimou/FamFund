import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

export type CheckoutPlan = 'en_famille' | 'avec_avocat'

const PRICE_IDS: Record<CheckoutPlan, string | undefined> = {
  en_famille:   process.env.STRIPE_PRICE_EN_FAMILLE,
  avec_avocat:  process.env.STRIPE_PRICE_AVEC_AVOCAT,
}

const MODES: Record<CheckoutPlan, 'subscription' | 'payment'> = {
  en_famille:  'subscription',
  avec_avocat: 'payment',
}

export async function POST(req: NextRequest) {
  const supabase  = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const plan  = body.plan as CheckoutPlan

  if (!plan || !PRICE_IDS[plan]) {
    return NextResponse.json({ error: 'Plan invalide ou prix non configuré.' }, { status: 400 })
  }

  const { data: project } = await supabase
    .from('projects')
    .select('id, stripe_customer_id')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Projet introuvable.' }, { status: 404 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://familyfund.fr'

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode:                 MODES[plan],
    locale:               'fr',
    payment_method_types: ['card'],
    line_items: [{ price: PRICE_IDS[plan]!, quantity: 1 }],
    success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
    cancel_url:  `${appUrl}/tarifs`,
    customer_email: project.stripe_customer_id ? undefined : user.email ?? undefined,
    customer:       project.stripe_customer_id ?? undefined,
    metadata: {
      projectId: project.id,
      userId:    user.id,
      plan,
    },
  }

  // Pour les abonnements, stocker le projectId dans subscription_data
  if (MODES[plan] === 'subscription') {
    sessionParams.subscription_data = {
      metadata: { projectId: project.id, userId: user.id },
    }
  }

  const session = await stripe.checkout.sessions.create(sessionParams)

  return NextResponse.json({ url: session.url })
}
