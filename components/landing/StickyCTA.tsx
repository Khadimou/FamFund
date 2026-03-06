'use client'

import { useEffect, useState } from 'react'

export default function StickyCTA() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const target = document.getElementById('hero-form')
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  const scrollToForm = () => {
    document.getElementById('hero-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-primary px-4 pb-safe py-3 shadow-lg transition-transform duration-300 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <button
        onClick={scrollToForm}
        className="w-full bg-accent text-primary-dark font-semibold py-3 rounded-xl text-sm"
      >
        Obtenir mon accès anticipé →
      </button>
    </div>
  )
}
