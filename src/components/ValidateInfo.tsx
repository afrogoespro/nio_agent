import { useId, useState } from 'react'
import './ValidateInfo.css'

export function ValidateInfo() {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <span className="validate-info">
      <button
        type="button"
        className="validate-info__trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        What is Validate?
      </button>
      {open && (
        <div id={panelId} className="validate-info__panel" role="tooltip">
          <p>
            Neo quietly tests your opener with a small slice of your market: subject
            lines, open rates, and replies. When a winner is clear, we roll that version
            out to your full list automatically.
          </p>
          <p className="validate-info__fine">
            You do not manage the test. We bring back the best proof, then go live.
          </p>
        </div>
      )}
    </span>
  )
}
