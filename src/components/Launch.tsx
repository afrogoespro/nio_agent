import { getAgent } from '../lib/agents'
import type { OutreachPlan, WizardInput } from '../types/plan'
import { FlowProgress } from './FlowProgress'
import { CopyButton } from './CopyButton'
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

  const copyAll = [
    `Subject: ${plan.sampleEmail.subject}`,
    plan.sampleEmail.body,
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
        <p className="launch__eyebrow">You&apos;re ready</p>
        <h1 className="launch__title">Launch your outreach</h1>
        <p className="launch__lede">
          Your rep built a plan for <strong>{truncate(input.idealCustomer, 60)}</strong>.
          Connect your tools below or copy emails to send by hand.
        </p>

        <ol className="launch__checklist">
          <li>
            <strong>Connect your email</strong> and send a test
          </li>
          <li>
            <strong>Connect Apollo</strong> to find leads like {plan.icpExample.name}
          </li>
          <li>
            <strong>Turn on warm up drip</strong> for Day 1, 4, and 8
          </li>
        </ol>

        <IntegrationsPanel
          plan={plan}
          customerLocation={input.customerLocation}
          idealCustomer={input.idealCustomer}
        />

        <div className="launch__actions">
          <CopyButton text={copyAll} label="Copy emails to send" />
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

function truncate(s: string, n: number): string {
  const t = s.trim()
  return t.length <= n ? t : `${t.slice(0, n - 1)}…`
}
