import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Service non configuré.' }, { status: 503 })
  }

  try {
    const { name, email, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 })
    }

    const resend = new Resend(apiKey)

    await resend.emails.send({
      from: 'FamilyFund <onboarding@resend.dev>',
      to:   'contact@familyfund.fr',
      replyTo: email,
      subject: `Message de ${name} via familyfund.fr`,
      text: `Nom : ${name}\nEmail : ${email}\n\nMessage :\n${message}`,
      html: `
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Email :</strong> <a href="mailto:${email}">${email}</a></p>
        <br/>
        <p><strong>Message :</strong></p>
        <p style="white-space:pre-line">${message}</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Envoi impossible. Réessayez dans quelques instants.' },
      { status: 500 },
    )
  }
}
