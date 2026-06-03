import { useState, type FormEvent } from 'react'
import './PlaybookTraitsSlide.css'

interface PlaybookTraitsSlideProps {
  baseTraits: string[]
  extraTraits: string[]
  onExtraTraitsChange: (traits: string[]) => void
}

export function PlaybookTraitsSlide({
  baseTraits,
  extraTraits,
  onExtraTraitsChange,
}: PlaybookTraitsSlideProps) {
  const [draft, setDraft] = useState('')

  function addTrait(e?: FormEvent) {
    e?.preventDefault()
    const text = draft.trim()
    if (!text) return
    const lower = text.toLowerCase()
    const exists =
      baseTraits.some((t) => t.toLowerCase() === lower) ||
      extraTraits.some((t) => t.toLowerCase() === lower)
    if (exists) {
      setDraft('')
      return
    }
    onExtraTraitsChange([...extraTraits, text])
    setDraft('')
  }

  function removeTrait(index: number) {
    onExtraTraitsChange(extraTraits.filter((_, i) => i !== index))
  }

  return (
    <div className="playbook-slide">
      <p className="playbook-slide__lede">Look for people who match these traits.</p>
      <ul className="playbook__list">
        {baseTraits.map((t) => (
          <li key={t}>{t}</li>
        ))}
        {extraTraits.map((t, i) => (
          <li key={`extra-${t}-${i}`} className="playbook-traits__extra-item">
            <span>{t}</span>
            <button
              type="button"
              className="playbook-traits__remove"
              onClick={() => removeTrait(i)}
              aria-label={`Remove ${t}`}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <form className="playbook-traits__add" onSubmit={addTrait}>
        <label className="playbook-traits__label" htmlFor="extra-trait">
          Anything else Neo should look for?
        </label>
        <div className="playbook-traits__row">
          <input
            id="extra-trait"
            className="playbook-traits__input"
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. Uses Instagram, 2+ locations, hiring front desk…"
            maxLength={120}
          />
          <button type="submit" className="playbook-traits__add-btn" disabled={!draft.trim()}>
            Add
          </button>
        </div>
        <p className="playbook-traits__hint">Optional. We&apos;ll use this when building your list.</p>
      </form>
    </div>
  )
}
