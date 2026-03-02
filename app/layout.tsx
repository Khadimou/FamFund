import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ToastProvider } from '@/components/ui/toast-context'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://fam-fund.vercel.app'),
  title: 'FamilyFund — Levez vos premiers fonds auprès de votre famille. Sans les conflits.',
  description:
    "FamilyFund structure votre love money : chaque proche renseigne ce qu'il peut investir, vous pilotez tout depuis un tableau de bord clair et privé.",
  keywords: ['love money', 'levée de fonds', 'famille', 'entrepreneur', 'financement familial', 'startup'],
  openGraph: {
    title: 'FamilyFund — Levez vos premiers fonds sans les conflits',
    description: 'Organisez votre love money en toute transparence avec votre famille.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'FamilyFund',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FamilyFund — Structurez votre love money',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FamilyFund — Levez vos premiers fonds sans les conflits',
    description: 'Organisez votre love money en toute transparence avec votre famille.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const analyticsId = process.env.NEXT_PUBLIC_ANALYTICS_ID

  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {analyticsId && (
          <Script
            defer
            data-domain={analyticsId}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="font-sans bg-background text-text antialiased">
        <ToastProvider>
          {children}
          <Toaster />
        </ToastProvider>
        <Analytics />
      </body>
    </html>
  )
}
