import { useEffect, useState } from 'react'
import './LoadingState.css'

const MESSAGES = [
  'Your rep is finding someone to contact…',
  'Your rep is writing your opening email…',
  'Your rep is planning your follow-ups…',
]

export function LoadingState() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length)
    }, 2400)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="loading-state__spinner" aria-hidden="true" />
      <p className="loading-state__text">{MESSAGES[index]}</p>
      <p className="loading-state__hint">On duty 24/7 — usually just a few seconds</p>
    </div>
  )
}
