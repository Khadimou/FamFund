'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  CreditCard,
  FileCheck,
  ChevronLeft,
  LogOut,
} from 'lucide-react'
import { signOut } from '@/app/actions/auth'

const NAV_ITEMS = [
  { href: '/dashboard',        label: 'Dashboard',          icon: LayoutDashboard },
  { href: '/famille',          label: 'Famille',            icon: Users           },
  { href: '/projet',           label: 'Mon Projet',         icon: Briefcase       },
  { href: '/documents',        label: 'Documents',          icon: FileText        },
  { href: '/profil-financier', label: 'Profil Financier',   icon: TrendingUp      },
  { href: '/remboursements',   label: 'Remboursements',     icon: CreditCard      },
  { href: '/lettre-synthese',  label: 'Lettre synthèse',    icon: FileCheck       },
]

// Couleurs sidebar (hors config Tailwind → valeurs arbitraires)
const S = {
  bg:       'hsl(155,33%,18%)',
  bgActive: 'hsl(155,30%,24%)',
  text:     'hsl(34,47%,96%)',
  accent:   'hsl(152,38%,52%)',
  subtle:   'hsl(34,47%,80%)',
  border:   'hsl(155,30%,22%)',
}

interface Props {
  firstName: string | null
  lastName:  string | null
}

export default function AppSidebar({ firstName, lastName }: Props) {
  const pathname  = usePathname()
  const [open, setOpen] = useState(true)

  const initials =
    [firstName, lastName]
      .filter(Boolean)
      .map((n) => n![0].toUpperCase())
      .join('') || '?'

  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Mon compte'

  return (
    <aside
      style={{ background: S.bg, width: open ? 260 : 64 }}
      className="relative shrink-0 flex flex-col h-screen transition-[width] duration-300 ease-in-out overflow-hidden"
    >
      {/* ── Logo ── */}
      <div
        style={{ borderColor: S.border }}
        className="flex items-center gap-3 px-4 py-5 border-b shrink-0"
      >
        {/* Carré logo */}
        <div
          style={{ background: S.accent, color: S.bg }}
          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0"
        >
          F
        </div>

        {open && (
          <div className="overflow-hidden">
            <p style={{ color: S.text }} className="font-serif text-base font-semibold leading-tight whitespace-nowrap">
              FamilyFund
            </p>
            <p style={{ color: S.subtle }} className="text-[10px] leading-tight whitespace-nowrap">
              Le notaire du love money
            </p>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

          return (
            <Link
              key={href}
              href={href}
              title={open ? undefined : label}
              style={{
                background: active ? S.bgActive : 'transparent',
                color:      active ? S.text     : S.subtle,
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:opacity-100"
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = S.bgActive
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              <Icon
                size={17}
                style={{ color: active ? S.accent : 'inherit' }}
                className="shrink-0"
              />
              {open && <span className="whitespace-nowrap">{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* ── Profil + déconnexion ── */}
      <div style={{ borderColor: S.border }} className="border-t px-2 py-3 space-y-1 shrink-0">
        {/* Avatar */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div
            style={{ background: S.bgActive, color: S.accent }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          >
            {initials}
          </div>
          {open && (
            <div className="overflow-hidden">
              <p style={{ color: S.text }} className="text-sm font-medium whitespace-nowrap truncate">
                {fullName}
              </p>
              <p style={{ color: S.subtle }} className="text-xs whitespace-nowrap">
                Plan Famille
              </p>
            </div>
          )}
        </div>

        {/* Déconnexion */}
        <form action={signOut}>
          <button
            type="submit"
            title={open ? undefined : 'Se déconnecter'}
            style={{ color: S.subtle }}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium transition-colors hover:bg-red-900/30 hover:text-red-300"
          >
            <LogOut size={17} className="shrink-0" />
            {open && <span className="whitespace-nowrap">Se déconnecter</span>}
          </button>
        </form>
      </div>

      {/* ── Bouton collapse ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        title={open ? 'Réduire' : 'Agrandir'}
        style={{
          background:   S.bgActive,
          color:        S.text,
          borderColor:  S.border,
          right:        open ? -12 : -12,
        }}
        className="absolute top-20 -right-3 w-6 h-6 rounded-full border flex items-center justify-center shadow-md transition-transform duration-300 z-10"
      >
        <ChevronLeft
          size={14}
          style={{ transform: open ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 300ms' }}
        />
      </button>
    </aside>
  )
}
