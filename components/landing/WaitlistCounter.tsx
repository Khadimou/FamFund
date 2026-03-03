'use client'

import { useEffect, useState } from 'react'

export default function WaitlistCounter({ initial }: { initial: number }) {
  const [count, setCount] = useState(initial)

  useEffect(() => {
    fetch('/api/waitlist/count')
      .then((r) => r.json())
      .then((d) => { if (typeof d.count === 'number') setCount(d.count) })
      .catch(() => {})
  }, [])

  return <>{count}</>
}
