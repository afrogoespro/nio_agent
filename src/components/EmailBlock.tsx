import type { EmailMessage } from '../types/plan'
import { CopyButton } from './CopyButton'

interface EmailBlockProps {
  label?: string
  email: EmailMessage
}

export function EmailBlock({ label, email }: EmailBlockProps) {
  const full = `Subject: ${email.subject}\n\n${email.body}`

  return (
    <article className="email-block">
      {label && <p className="email-block__label">{label}</p>}
      <div className="email-block__header">
        <span className="email-block__subject">{email.subject}</span>
        <CopyButton text={full} />
      </div>
      <pre className="email-block__body">{email.body}</pre>
    </article>
  )
}
