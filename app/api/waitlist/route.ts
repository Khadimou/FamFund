import { NextResponse } from 'next/server'

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const upstream = await fetch(`${FASTAPI_URL}/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await upstream.json()

    if (!upstream.ok) {
      return NextResponse.json(data, { status: upstream.status })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Service temporairement indisponible. Réessayez dans quelques instants.' },
      { status: 503 }
    )
  }
}
