const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ── Client interne ─────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers: extra, ...rest } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extra as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const res = await fetch(`${FASTAPI_URL}${path}`, {
    ...rest,
    headers,
    cache: 'no-store', // Toujours des données fraîches dans les Server Components
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: 'Erreur serveur' }))
    throw new ApiError(res.status, body.detail ?? `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

// ── Fonctions exposées ─────────────────────────────────────────────────────

export const apiGet = <T>(path: string, token?: string) =>
  apiFetch<T>(path, { method: 'GET', token })

export const apiPost = <T>(path: string, body: unknown, token?: string) =>
  apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body), token })

export const apiPatch = <T>(path: string, body: unknown, token?: string) =>
  apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body), token })

export const apiDelete = <T>(path: string, token?: string) =>
  apiFetch<T>(path, { method: 'DELETE', token })
