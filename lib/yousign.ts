const BASE = process.env.YOUSIGN_API_URL ?? 'https://api-sandbox.yousign.app/v3'

async function ys(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.YOUSIGN_API_KEY!}`,
      ...(options.headers ?? {}),
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Yousign ${path} → ${res.status}: ${text}`)
  }
  return res.json()
}

export async function createSignatureRequest(name: string) {
  return ys('/signature_requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, delivery_mode: 'email' }),
  }) as Promise<{ id: string }>
}

export async function uploadDocument(requestId: string, pdf: Buffer, filename: string) {
  const form = new FormData()
  form.append('file', new Blob([new Uint8Array(pdf)], { type: 'application/pdf' }), filename)
  form.append('nature', 'signable_document')
  return ys(`/signature_requests/${requestId}/documents`, {
    method: 'POST',
    body: form,
  }) as Promise<{ id: string }>
}

export async function addSigner(
  requestId: string,
  documentId: string,
  info: { first_name: string; last_name: string; email: string },
  x: number,
  y: number,
  page = 1,
) {
  return ys(`/signature_requests/${requestId}/signers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      info: { ...info, locale: 'fr' },
      signature_level: 'electronic_signature',
      signature_authentication_mode: 'no_otp',
      fields: [{ type: 'signature', document_id: documentId, page, x, y }],
    }),
  })
}

export async function activateSignatureRequest(requestId: string) {
  return ys(`/signature_requests/${requestId}/activate`, { method: 'POST' })
}
