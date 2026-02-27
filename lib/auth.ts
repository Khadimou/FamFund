import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Retourne le token JWT depuis le cookie HTTP-only.
 * Utilisable uniquement dans les Server Components et Route Handlers.
 */
export function getAuthToken(): string | undefined {
  return cookies().get('auth_token')?.value
}

/**
 * Exige un token valide. Redirige vers /login si absent.
 * À appeler en haut d'un Server Component protégé.
 */
export function requireAuth(): string {
  const token = getAuthToken()
  if (!token) redirect('/login')
  return token
}
