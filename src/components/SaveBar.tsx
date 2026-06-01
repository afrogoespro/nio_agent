import './SaveBar.css'

interface SaveBarProps {
  onSignUp?: () => void
}

export function SaveBar({ onSignUp }: SaveBarProps) {
  return (
    <aside className="save-bar">
      <div className="save-bar__inner">
        <p className="save-bar__text">
          <strong>Keep your rep on the job.</strong> Sign up to save this playbook
          — otherwise it clears when you close this tab.
        </p>
        <button
          type="button"
          className="save-bar__btn"
          onClick={onSignUp ?? (() => alert('Sign up coming soon — for now, copy your playbook below!'))}
        >
          Save my rep&apos;s work
        </button>
      </div>
    </aside>
  )
}
