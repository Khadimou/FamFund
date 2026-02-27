import { NextResponse } from 'next/server'

export async function GET() {
  const res = await fetch(
    `${process.env.FASTAPI_URL ?? 'http://localhost:8000'}/waitlist/count`,
    { cache: 'no-store' },
  )
  const data = await res.json()
  return NextResponse.json(data)
}
