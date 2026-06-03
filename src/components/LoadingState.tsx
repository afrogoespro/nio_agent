import { useEffect, useState } from 'react'
import { getAgent } from '../lib/agents'
import type { AgentId } from '../types/plan'
import './LoadingState.css'

const STEP_LABELS = [
  'Browse & match',
  'Scan companies',
  'Score fit',
  'Gather context',
  'Write your plan',
] as const

const STEP_MESSAGES = [
  'Browsing the web for a perfect match…',
  'Scanning companies and titles in your target area…',
  'Checking who fits your ideal customer profile…',
  'Pulling context before writing your first note…',
  'Drafting your opening email and follow-up plan…',
] as const

const STEP_MS = 1400

interface LoadingStateProps {
  agentId?: AgentId | null
}

export function LoadingState({ agentId }: LoadingStateProps) {
  const agent = agentId ? getAgent(agentId) : undefined
  const rep = agent?.displayName ?? 'Neo'
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
    const id = setInterval(() => {
      setIndex((i) => Math.min(i + 1, STEP_MESSAGES.length - 1))
    }, STEP_MS)
    return () => clearInterval(id)
  }, [])

  const headline = `${rep} is ${STEP_MESSAGES[index].charAt(0).toLowerCase()}${STEP_MESSAGES[index].slice(1)}`

  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="loading-state__spinner" aria-hidden="true" />
      <p className="loading-state__text">{headline}</p>
      <p className="loading-state__hint">Deep dive in progress — this usually takes a few seconds.</p>
      <ol className="loading-state__steps" aria-label="Progress">
        {STEP_LABELS.map((step, i) => (
          <li
            key={step}
            className={`loading-state__step ${i < index ? 'loading-state__step--done' : ''} ${i === index ? 'loading-state__step--active' : ''}`}
          >
            <span className="loading-state__step-dot" aria-hidden="true" />
            <span className="loading-state__step-label">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
