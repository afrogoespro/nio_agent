import { useEffect, useState } from 'react'
import type { ApolloPerson } from '../lib/apolloSearch'
import { getAgent } from '../lib/agents'
import { fetchLeadBatch } from '../lib/integrationsApi'
import {
  buildDemoLeadList,
  mapApolloPersonToQueueLead,
  padLeadList,
  type QueueLead,
} from '../lib/leadList'
import type { OutreachPlan, WizardInput } from '../types/plan'
import { loadPlanFromSession, savePlanToSession } from '../lib/session'
import { FlowProgress } from './FlowProgress'
import './CampaignQueue.css'

interface CampaignQueueProps {
  plan: OutreachPlan
  input: WizardInput
  onContinue: () => void
  onBack: () => void
  onStartOver: () => void
}

export function CampaignQueue({
  plan,
  input,
  onContinue,
  onBack,
  onStartOver,
}: CampaignQueueProps) {
  const agent = getAgent(input.agentId)
  const validation = loadPlanFromSession()?.validationEnabled
  const [leads, setLeads] = useState<QueueLead[] | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setStatus(null)

      const result = await fetchLeadBatch({
        idealCustomer: input.idealCustomer,
        customerLocation: input.customerLocation,
      })

      if (cancelled) return

      const fallbackArea =
        input.customerLocation.trim() || input.yourLocation.trim() || 'Your area'
      let list: QueueLead[] = []

      if (result.ok && Array.isArray(result.people) && result.people.length > 0) {
        list = (result.people as ApolloPerson[]).map((p, i) =>
          mapApolloPersonToQueueLead(p, i, fallbackArea),
        )
        if (list.length < 10) {
          list = padLeadList(list, input, plan.icpExample, 10)
          setStatus(
            `Found ${result.people.length} live matches. Filled the rest with similar examples for this demo.`,
          )
        } else {
          setStatus('Neo found 10 people who match your target.')
        }
      } else {
        list = buildDemoLeadList(input, plan.icpExample, 10)
        setStatus(
          result.message ??
            'Using example contacts for this walkthrough. Neo will still run the full process on your list.',
        )
      }

      setLeads(list)
      const snap = loadPlanFromSession()
      savePlanToSession(plan, input, snap?.extraIcpTraits ?? [], {
        leadApproved: snap?.leadApproved,
        validationEnabled: snap?.validationEnabled,
        queueLeads: list,
      })
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [input, plan.icpExample])

  return (
    <div className="campaign-queue">
      <header className="campaign-queue__header">
        <div className="campaign-queue__nav-row">
          <button type="button" className="campaign-queue__back" onClick={onBack}>
            ← Back
          </button>
          <button type="button" className="campaign-queue__start-over" onClick={onStartOver}>
            Start over
          </button>
        </div>
        <FlowProgress current={6} />
        <div className="campaign-queue__title-block">
          {agent && (
            <img
              className="campaign-queue__avatar"
              src={agent.image}
              alt=""
              width={48}
              height={48}
            />
          )}
          <div>
            <p className="campaign-queue__step-label">Step 6 of 7 · Your list</p>
            <h1>Neo is building your outreach list</h1>
          </div>
        </div>
      </header>

      <main className="campaign-queue__main">
        {loading && (
          <div className="campaign-queue__loading" role="status">
            <p className="campaign-queue__loading-title">Finding 10 people to reach out to…</p>
            <p className="campaign-queue__loading-sub">
              Searching near <strong>{input.customerLocation}</strong> for{' '}
              <strong>{input.idealCustomer}</strong>.
            </p>
          </div>
        )}

        {!loading && leads && (
          <>
            {status && (
              <p className="campaign-queue__status" role="status">
                {status}
              </p>
            )}

            <ul className="campaign-queue__list">
              {leads.map((lead, i) => (
                <li key={lead.id} className="campaign-queue__item">
                  <span className="campaign-queue__num">{i + 1}</span>
                  <div className="campaign-queue__meta">
                    <strong>{lead.name}</strong>
                    <span>
                      {lead.title} · {lead.company}
                    </span>
                    <span className="campaign-queue__place">{lead.place}</span>
                  </div>
                  {lead.source === 'apollo' && (
                    <span className="campaign-queue__badge">Live</span>
                  )}
                </li>
              ))}
            </ul>

            <div className="campaign-queue__promise">
              <p className="campaign-queue__promise-title">
                {validation ? 'Validate is running — Neo is on it.' : 'Perfect — Neo is on it.'}
              </p>
              <p>
                {validation ? (
                  <>
                    Neo is testing your opener with a small slice of your market. When a winner
                    is clear, we promote it and build custom messages for everyone on this list
                    over the <strong>next 24 hours</strong>.
                  </>
                ) : (
                  <>
                    Over the <strong>next 24 hours</strong>, your Neo Rep will research each
                    person, build short profiles, and draft a custom message for every contact.
                    We&apos;ll queue everything so you can review when you&apos;re ready.
                  </>
                )}
              </p>
            </div>

            <div className="campaign-queue__actions">
              <button type="button" className="campaign-queue__cta" onClick={onContinue}>
                Continue to launch →
              </button>
              <button
                type="button"
                className="campaign-queue__secondary"
                onClick={onStartOver}
              >
                Start a new plan
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
