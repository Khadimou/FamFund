'use client'

import { X, CheckCircle } from 'lucide-react'
import { useToast } from './toast-context'

export function Toaster() {
  const { toasts, dismiss } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm px-4 sm:px-0">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-start gap-3 bg-white border border-gray-100 rounded-2xl shadow-lg p-4 animate-slide-in"
        >
          <CheckCircle size={18} className="shrink-0 text-primary mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-text text-sm">{t.title}</p>
            {t.description && (
              <p className="text-xs text-muted mt-0.5 leading-relaxed">{t.description}</p>
            )}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
            aria-label="Fermer la notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
