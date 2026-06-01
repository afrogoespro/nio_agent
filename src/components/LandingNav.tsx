import { useEffect, useId, useState } from 'react'
import { BrandMark } from './BrandMark'
import './LandingNav.css'

interface LandingNavProps {
  onTry: () => void
}

export function LandingNav({ onTry }: LandingNavProps) {
  const [open, setOpen] = useState(false)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  function close() {
    setOpen(false)
  }

  function handleTry() {
    close()
    onTry()
  }

  function scrollTo(id: string) {
    close()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className="landing-nav">
      <BrandMark />

      <button
        type="button"
        className="landing-nav__menu-btn"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="landing-nav__menu-icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      {open && (
        <>
          <button
            type="button"
            className="landing-nav__backdrop"
            aria-label="Close menu"
            onClick={close}
          />
          <nav id={menuId} className="landing-nav__panel landing-nav__panel--open">
            <ul className="landing-nav__links">
              <li>
                <button type="button" onClick={() => scrollTo('how-it-works')}>
                  How it works
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollTo('channels')}>
                  Channels
                </button>
              </li>
              <li>
                <button type="button" className="landing-nav__try" onClick={handleTry}>
                  Ok, let&apos;s try it
                </button>
              </li>
            </ul>
          </nav>
        </>
      )}
    </header>
  )
}
