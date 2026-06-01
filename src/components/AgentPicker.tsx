import { AGENTS } from '../lib/agents'
import type { AgentId } from '../types/plan'
import './AgentPicker.css'

interface AgentPickerProps {
  value: AgentId | null
  onChange: (id: AgentId) => void
}

export function AgentPicker({ value, onChange }: AgentPickerProps) {
  return (
    <div
      className="agent-picker"
      role="radiogroup"
      aria-label="Pick how your rep should sound"
    >
      {AGENTS.map((agent) => {
        const selected = value === agent.id
        return (
          <button
            key={agent.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${agent.name}. ${agent.tagline}`}
            className={`agent-picker__card ${selected ? 'agent-picker__card--selected' : ''}`}
            onClick={() => onChange(agent.id)}
          >
            <div className="agent-picker__avatar-wrap">
              <img
                className="agent-picker__avatar"
                src={agent.image}
                alt=""
                width={72}
                height={72}
                loading="lazy"
              />
              {selected && (
                <span className="agent-picker__check" aria-hidden="true">
                  ✓
                </span>
              )}
            </div>
            <div className="agent-picker__content">
              <span className="agent-picker__name">{agent.name}</span>
              <span className="agent-picker__tagline">{agent.tagline}</span>
              <span className="agent-picker__sample">
                e.g. &ldquo;{agent.sampleSubject}&rdquo;
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
