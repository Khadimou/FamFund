/**
 * Domaines d'emails temporaires / suspects à bloquer.
 * Ajouter un domaine ici le bloque automatiquement côté client ET serveur.
 */
export const BLOCKED_DOMAINS = [
  'bdcimail.com',
  'mailnull.com',
  'guerrillamail.com',
  'throwam.com',
  'trashmail.com',
  'yopmail.com',
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  'sharklasers.com',
  'guerrillamailblock.com',
  'grr.la',
  'guerrillamail.info',
  'guerrillamail.biz',
  'guerrillamail.de',
  'guerrillamail.net',
  'guerrillamail.org',
  'spam4.me',
  'dispostable.com',
  'fakeinbox.com',
  'maildrop.cc',
  'trashmail.at',
  'trashmail.io',
  'trashmail.me',
  'trashmail.net',
]

export function isBlockedDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return false
  return BLOCKED_DOMAINS.includes(domain)
}
