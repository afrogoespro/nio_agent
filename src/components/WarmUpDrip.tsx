import type { OutreachPlan, WizardInput } from '../types/plan'
import { getAgent } from '../lib/agents'
import { loadPlanFromSession } from '../lib/session'
import { FlowProgress } from './FlowProgress'
import { EmailBlock } from './EmailBlock'
import { CopyButton } from './CopyButton'
import './WarmUpDrip.css'

interface WarmUpDripProps {
  plan: OutreachPlan
  input: WizardInput
  onContinue: () => void
  onBack: () => void
  onStartOver: () => void
}

export function WarmUpDrip({ plan, input, onContinue, onBack, onStartOver }: WarmUpDripProps) {
  const agent = getAgent(input.agentId)
  const validation = loadPlanFromSession()?.validationEnabled

  const copyDrip = plan.drip
    .map((d) => `=== ${d.dayLabel} ===\nSubject: ${d.subject}\n${d.body}`)
    .join('\n\n')

  return (
    <div className="warm-drip">
      <header className="warm-drip__header">
        <div className="warm-drip__nav-row">
          <button type="button" className="warm-drip__back" onClick={onBack}>
            ← Back
          </button>
          <button type="button" className="warm-drip__start-over" onClick={onStartOver}>
            Start over
          </button>
        </div>
        <FlowProgress current={5} />
        <div className="warm-drip__title-block">
          {agent && (
            <img className="warm-drip__avatar" src={agent.image} alt="" width={48} height={48} />
          )}
          <div>
            <p className="warm-drip__step-label">Step 5 of 7 · Warm up drip</p>
            <h1>Warm up drip</h1>
          </div>
          <CopyButton text={copyDrip} label="Copy drip" className="warm-drip__copy" />
        </div>
        <p className="warm-drip__lede">
          Day 1 is your opening note. These follow ups nudge the thread without sounding
          like a campaign.
        </p>
        {validation && (
          <p className="warm-drip__validate-banner" role="status">
            Validate is on. Neo will test subject lines and open rates on a small audience,
            then promote the winner to your live list.
          </p>
        )}
      </header>

      <main className="warm-drip__main">
        {plan.drip.map((email) => (
          <EmailBlock key={email.dayLabel} label={email.dayLabel} email={email} />
        ))}
      </main>

      <footer className="warm-drip__footer">
        <button type="button" className="warm-drip__cta" onClick={onContinue}>
          Build my list →
        </button>
      </footer>
    </div>
  )
}
