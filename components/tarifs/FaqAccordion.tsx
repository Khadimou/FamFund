'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  {
    q: 'Est-ce que je paie par contrat ou par projet ?',
    a: 'Par projet. Une fois le Pack Projet activé, vous générez autant de contrats que vous avez de contributeurs — prêt, don, pacte d\'associé — sans frais supplémentaires.',
  },
  {
    q: 'La lettre de synthèse bancaire est-elle payante ?',
    a: 'Non. Elle est incluse dans le plan gratuit. Vous pouvez la générer et la présenter à votre banque ou à BPI France sans aucun paiement.',
  },
  {
    q: 'Que se passe-t-il si je résilie le Suivi mensuel ?',
    a: 'Votre accès au tableau de remboursements et aux rappels automatiques est suspendu à la fin de la période en cours. Vos données et contrats restent conservés et accessibles. Vous pouvez réactiver le suivi à tout moment sans surcoût.',
  },
  {
    q: 'Les signatures sont-elles juridiquement valables ?',
    a: 'Oui. Nous intégrons Yousign, certifié eIDAS niveau avancé. Les signatures électroniques ont la même valeur juridique qu\'une signature manuscrite en droit français et européen.',
  },
  {
    q: 'Mes données financières sont-elles sécurisées ?',
    a: 'Toutes les données sont chiffrées, hébergées en France et ne sont jamais partagées avec des tiers. Chaque contributeur ne voit que sa propre contribution — jamais celles des autres.',
  },
]

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
      {FAQS.map((faq, i) => (
        <div key={i} className="bg-white">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-4 text-left gap-4 hover:bg-gray-50/60 transition-colors"
          >
            <span className="font-medium text-text text-sm">{faq.q}</span>
            <ChevronDown
              size={18}
              className={`text-muted shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
            />
          </button>
          {open === i && (
            <div className="px-6 pb-5">
              <p className="text-sm text-muted leading-relaxed">{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
