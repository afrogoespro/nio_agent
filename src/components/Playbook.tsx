import { useMemo } from 'react'
import type { OutreachPlan, WizardInput } from '../types/plan'
import { getAgent } from '../lib/agents'
import { FlowProgress } from './FlowProgress'
import { PlanCarousel, type PlanSlide } from './PlanCarousel'
import { IcpCard } from './IcpCard'
import { EmailBlock } from './EmailBlock'
import { CopyButton } from './CopyButton'
import './Playbook.css'

interface PlaybookProps {
  plan: OutreachPlan
  input: WizardInput
  onLaunch: () => void
  onStartOver: () => void
}

export function Playbook({ plan, input, onLaunch, onStartOver }: PlaybookProps) {
  const agent = getAgent(input.agentId)

  const copyAll = useMemo(
    () =>
      [
        `=== EXAMPLE PERSON ===`,
        `${plan.icpExample.name}, ${plan.icpExample.title}`,
        plan.icpExample.companyType,
        ...plan.icpExample.whyFit.map((w) => `• ${w}`),
        ``,
        `=== WHY THIS TARGET ===`,
        input.whyTarget,
        ``,
        `=== FIRST EMAIL ===`,
        `Subject: ${plan.sampleEmail.subject}`,
        plan.sampleEmail.body,
        ``,
        `=== WHO TO LOOK FOR ===`,
        ...plan.icpTraits.map((t) => `• ${t}`),
        ``,
        `=== WHERE TO FIND EMAILS ===`,
        ...plan.findLeadsTips.map((t) => `• ${t}`),
        ``,
        ...plan.drip.flatMap((d) => [
          `=== ${d.dayLabel.toUpperCase()} ===`,
          `Subject: ${d.subject}`,
          d.body,
          ``,
        ]),
      ].join('\n'),
    [plan, input.whyTarget],
  )

  const slides: PlanSlide[] = useMemo(() => {
    const list: PlanSlide[] = [
      {
        id: 'why',
        title: 'Why this target',
        content: (
          <div className="playbook-slide">
            <p className="playbook-slide__lede">
              Your rep focused on people like this.
            </p>
            <div className="playbook-slide__box">{input.whyTarget}</div>
            <div className="playbook-slide__locations">
              <p>
                <strong>You:</strong> {input.yourLocation}
              </p>
              <p>
                <strong>Your customers:</strong> {input.customerLocation}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: 'lead',
        title: 'Your first lead',
        content: (
          <div className="playbook-slide">
            <p className="playbook-slide__lede">
              {plan.icpExample.source === 'apollo'
                ? 'A real person from Apollo. Your email uses their name and company.'
                : 'Example only. Apollo did not return a match this time.'}
            </p>
            <IcpCard icp={plan.icpExample} />
          </div>
        ),
      },
      {
        id: 'open',
        title: 'Your opening email',
        content: (
          <div className="playbook-slide">
            <p className="playbook-slide__lede">Copy this and send when you are ready.</p>
            <EmailBlock label="Opening email" email={plan.sampleEmail} />
          </div>
        ),
      },
      {
        id: 'traits',
        title: 'Who else to look for',
        content: (
          <div className="playbook-slide">
            <p className="playbook-slide__lede">Look for people who match these traits.</p>
            <ul className="playbook__list">
              {plan.icpTraits.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        ),
      },
      {
        id: 'find',
        title: 'Where to find emails',
        content: (
          <div className="playbook-slide">
            <p className="playbook-slide__lede">
              Tips near <strong>{input.customerLocation}</strong>.
            </p>
            <ul className="playbook__list">
              {plan.findLeadsTips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        ),
      },
    ]

    plan.drip.forEach((email) => {
      if (email.dayLabel === 'Day 1') return
      list.push({
        id: email.dayLabel,
        title: `${email.dayLabel} follow up`,
        content: (
          <div className="playbook-slide">
            <p className="playbook-slide__lede">Send this on {email.dayLabel}.</p>
            <EmailBlock label={email.dayLabel} email={email} />
          </div>
        ),
      })
    })

    return list
  }, [plan, input])

  return (
    <div className="playbook">
      <header className="playbook__header">
        <button type="button" className="playbook__back" onClick={onStartOver}>
          ← Start over
        </button>
        <div className="playbook__flow">
          <FlowProgress current={4} />
        </div>
        <div className="playbook__title-block">
          {agent && (
            <img
              className="playbook__rep-avatar"
              src={agent.image}
              alt=""
              width={48}
              height={48}
            />
          )}
          <div>
            <p className="playbook__step-label">Step 4 of 5 · Your plan</p>
            <h1>Your rep&apos;s playbook</h1>
          </div>
          <CopyButton text={copyAll} label="Copy all" className="playbook__copy-all" />
        </div>
      </header>

      <main className="playbook__main playbook__main--carousel">
        <PlanCarousel slides={slides} onLaunch={onLaunch} />
      </main>
    </div>
  )
}
