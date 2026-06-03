import { useEffect, useMemo, useState } from 'react'
import type { OutreachPlan, WizardInput } from '../types/plan'
import { getAgent } from '../lib/agents'
import { emailContextFromLead, writeColdOpeningEmail } from '../lib/coldEmail'
import {
  getExtraIcpTraitsFromStored,
  loadPlanFromSession,
  savePlanToSession,
} from '../lib/session'
import { FlowProgress } from './FlowProgress'
import { PlanCarousel, type PlanSlide } from './PlanCarousel'
import { IcpCard } from './IcpCard'
import { EmailBlock } from './EmailBlock'
import { CopyButton } from './CopyButton'
import { PlaybookTraitsSlide } from './PlaybookTraitsSlide'
import { LeadMatchActions } from './LeadMatchActions'
import './Playbook.css'

interface PlaybookProps {
  plan: OutreachPlan
  input: WizardInput
  onContinueToDrip: () => void
  onFindMoreLikeLead: () => void
  onBack: () => void
  onStartOver: () => void
}

export function Playbook({
  plan,
  input,
  onContinueToDrip,
  onFindMoreLikeLead,
  onBack,
  onStartOver,
}: PlaybookProps) {
  const agent = getAgent(input.agentId)
  const [extraTraits, setExtraTraits] = useState<string[]>(() =>
    getExtraIcpTraitsFromStored(loadPlanFromSession()),
  )
  const [leadApproved, setLeadApproved] = useState(
    () => loadPlanFromSession()?.leadApproved ?? false,
  )

  useEffect(() => {
    savePlanToSession(plan, input, extraTraits, {
      leadApproved,
      validationEnabled: loadPlanFromSession()?.validationEnabled,
    })
  }, [plan, input, extraTraits, leadApproved])

  function approveLead(validation: boolean) {
    setLeadApproved(true)
    savePlanToSession(plan, input, extraTraits, {
      leadApproved: true,
      validationEnabled: validation,
    })
  }

  const allTraits = useMemo(
    () => [...plan.icpTraits, ...extraTraits],
    [plan.icpTraits, extraTraits],
  )

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
        ...allTraits.map((t) => `• ${t}`),
        ``,
        `=== WHERE TO FIND EMAILS ===`,
        ...plan.findLeadsTips.map((t) => `• ${t}`),
        ``,
        `=== WARM UP DRIP ===`,
        ...plan.drip.flatMap((d) => [
          `=== ${d.dayLabel.toUpperCase()} ===`,
          `Subject: ${d.subject}`,
          d.body,
          ``,
        ]),
      ].join('\n'),
    [plan, input.whyTarget, allTraits],
  )

  const openingEmail = useMemo(() => {
    const ctx = emailContextFromLead({
      name: plan.icpExample.name,
      firstName: plan.icpExample.firstName,
      title: plan.icpExample.title,
      companyName: plan.icpExample.companyName,
      place:
        plan.icpExample.whyFit
          .find((w) => w.toLowerCase().startsWith('based in'))
          ?.replace(/^based in /i, '') ?? input.customerLocation,
    })
    return writeColdOpeningEmail(input.agentId, input, ctx)
  }, [plan.icpExample, input])

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
                ? `Look what ${agent?.displayName ?? 'your rep'} found — here is someone who looks like a strong fit.`
                : `${agent?.displayName ?? 'Your rep'} is showing a sample profile — the same kind of person Neo will hunt for on your list.`}
            </p>
            <IcpCard icp={plan.icpExample} />
            <LeadMatchActions
              leadName={plan.icpExample.name}
              approved={leadApproved}
              onPerfect={() => approveLead(false)}
              onValidate={() => approveLead(true)}
              onFindMore={() => {
                approveLead(true)
                onFindMoreLikeLead()
              }}
            />
          </div>
        ),
      },
      {
        id: 'open',
        title: 'Your opening email',
        content: (
          <div className="playbook-slide">
            <p className="playbook-slide__lede">
              Written to feel personal, like a note on your own time, not a blast.
            </p>
            <EmailBlock label="Opening email" email={openingEmail} />
          </div>
        ),
      },
      {
        id: 'traits',
        title: 'Who else to look for',
        content: (
          <PlaybookTraitsSlide
            baseTraits={plan.icpTraits}
            extraTraits={extraTraits}
            onExtraTraitsChange={setExtraTraits}
          />
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

    return list
  }, [plan, input, extraTraits, agent, leadApproved, onFindMoreLikeLead, openingEmail])

  return (
    <div className="playbook">
      <header className="playbook__header">
        <div className="playbook__nav-row">
          <button type="button" className="playbook__back" onClick={onBack}>
            ← Back
          </button>
          <button type="button" className="playbook__start-over" onClick={onStartOver}>
            Start over
          </button>
        </div>
        <div className="playbook__flow">
          <FlowProgress current={4} />
        </div>
        {plan.apolloNote && plan.icpExample.source === 'example' && (
          <div className="playbook__apollo-alert" role="status">
            <strong>Demo lead for this run.</strong> {plan.apolloNote} Your emails
            below still work for a test walkthrough.
          </div>
        )}

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
            <p className="playbook__step-label">Step 4 of 7 · Your plan</p>
            <h1>Your rep&apos;s playbook</h1>
          </div>
          <CopyButton text={copyAll} label="Copy all" className="playbook__copy-all" />
        </div>
      </header>

      <main className="playbook__main playbook__main--carousel">
        <PlanCarousel
          slides={slides}
          onFinish={onContinueToDrip}
          gateSlideId="lead"
          canAdvance={leadApproved}
        />
      </main>
    </div>
  )
}
