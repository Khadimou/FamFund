import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Service non configuré.' }, { status: 503 })
  }

  try {
    const { name, email, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 })
    }

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender:  { name: 'FamilyFund', email: 'contact@familyfund.fr' },
        to:      [{ email: 'contact@familyfund.fr', name: 'FamilyFund' }],
        replyTo: { email, name },
        subject: `Message de ${name} via familyfund.fr`,
        textContent: `Nom : ${name}\nEmail : ${email}\n\nMessage :\n${message}`,
        htmlContent: `
          <p><strong>Nom :</strong> ${name}</p>
          <p><strong>Email :</strong> <a href="mailto:${email}">${email}</a></p>
          <br/>
          <p><strong>Message :</strong></p>
          <p style="white-space:pre-line">${message}</p>
        `,
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      console.error('Brevo error:', JSON.stringify(err))
      return NextResponse.json({ error: err.message ?? 'Envoi impossible. Réessayez.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Service temporairement indisponible. Réessayez dans quelques instants.' },
      { status: 503 },
    )
  }
}
