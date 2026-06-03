import { useMemo, useState } from 'react'
import { getAgent } from '../lib/agents'
import { emailContextFromLead, writeColdOpeningEmail } from '../lib/coldEmail'
import type { QueueLead } from '../lib/leadList'
import { loadPlanFromSession, savePlanToSession } from '../lib/session'
import type { OutreachPlan, WizardInput } from '../types/plan'
import { FlowProgress } from './FlowProgress'
import { CopyButton } from './CopyButton'
import { EmailBlock } from './EmailBlock'
import { IntegrationsPanel } from './IntegrationsPanel'
import './Launch.css'

interface LaunchProps {
  plan: OutreachPlan
  input: WizardInput
  onBack: () => void
  onStartOver: () => void
}

export function Launch({ plan, input, onBack, onStartOver }: LaunchProps) {
  const agent = getAgent(input.agentId)
  const stored = loadPlanFromSession()
  const queueLeads = stored?.queueLeads ?? []
  const targetLead: QueueLead | null =
    queueLeads[0] ??
    (plan.icpExample
      ? {
          id: 'preview',
          name: plan.icpExample.name,
          title: plan.icpExample.title,
          company: plan.icpExample.companyName,
          place:
            plan.icpExample.whyFit
              .find((w) => w.toLowerCase().startsWith('based in'))
              ?.replace(/^based in /i, '') ?? input.customerLocation,
          source: plan.icpExample.source,
        }
      : null)

  const [senderName, setSenderName] = useState(input.senderName ?? '')
  const [senderEmail, setSenderEmail] = useState('')

  const liveInput = useMemo(
    () => ({ ...input, senderName: senderName.trim() || input.senderName }),
    [input, senderName],
  )

  const outboundEmail = useMemo(() => {
    if (!targetLead) return plan.sampleEmail
    const ctx = emailContextFromLead({
      name: targetLead.name,
      title: targetLead.title,
      company: targetLead.company,
      place: targetLead.place,
    })
    return writeColdOpeningEmail(input.agentId, liveInput, ctx)
  }, [targetLead, plan.sampleEmail, input.agentId, liveInput])

  function persistSender() {
    const next = { ...input, senderName: senderName.trim() }
    savePlanToSession(plan, next, stored?.extraIcpTraits ?? [], {
      leadApproved: stored?.leadApproved,
      validationEnabled: stored?.validationEnabled,
      queueLeads,
    })
  }

  const copyAll = [
    `To: ${targetLead?.name ?? plan.icpExample.name}`,
    `Subject: ${outboundEmail.subject}`,
    outboundEmail.body,
    ``,
    ...plan.drip.map(
      (d) => `=== ${d.dayLabel} ===\nSubject: ${d.subject}\n${d.body}\n`,
    ),
  ].join('\n')

  return (
    <div className="launch">
      <div className="launch__inner">
        <button type="button" className="launch__back" onClick={onBack}>
          ← Back
        </button>
        <div className="launch__flow">
          <FlowProgress current={7} />
        </div>
        {agent && (
          <img
            className="launch__avatar"
            src={agent.image}
            alt=""
            width={80}
            height={80}
          />
        )}
        <p className="launch__eyebrow">Step 7 of 7 · Preview</p>
        <h1 className="launch__title">Preview your first send</h1>
        <p className="launch__lede">
          This is the message Neo would send first
          {targetLead ? (
            <>
              {' '}
              to <strong>{targetLead.name}</strong> at {targetLead.company}.
            </>
          ) : (
            '.'
          )}
        </p>

        <section className="launch__preview-card">
          <p className="launch__preview-label">Message going out</p>
          {targetLead && (
            <p className="launch__preview-to">
              To: <strong>{targetLead.name}</strong> · {targetLead.title} ·{' '}
              {targetLead.place}
            </p>
          )}
          <EmailBlock label="Opening email" email={outboundEmail} />
        </section>

        <section className="launch__sender">
          <h2 className="launch__sender-title">Your sender info</h2>
          <label className="launch__sender-label" htmlFor="launch-sender-name">
            Name on the email
          </label>
          <input
            id="launch-sender-name"
            type="text"
            className="launch__sender-input"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            onBlur={persistSender}
            placeholder="Your name"
          />
          <label className="launch__sender-label" htmlFor="launch-sender-email">
            Your email (for test send below)
          </label>
          <input
            id="launch-sender-email"
            type="email"
            className="launch__sender-input"
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </section>

        <h2 className="launch__connect-title">Connect & send</h2>
        <ol className="launch__checklist">
          <li>
            <strong>Send a test</strong> to yourself below
          </li>
          <li>
            <strong>Warm up drip</strong> runs on Day 4 and Day 8 after they reply
          </li>
        </ol>

        <IntegrationsPanel
          plan={plan}
          customerLocation={input.customerLocation}
          idealCustomer={input.idealCustomer}
          previewEmail={outboundEmail}
          defaultFromName={senderName.trim()}
        />

        <div className="launch__actions">
          <CopyButton text={copyAll} label="Copy message" />
          <button type="button" className="launch__secondary" onClick={onStartOver}>
            Start a new plan
          </button>
        </div>

        <p className="launch__note">
          Sign up to save your rep&apos;s work. Coming soon.
        </p>
      </div>
    </div>
  )
}
