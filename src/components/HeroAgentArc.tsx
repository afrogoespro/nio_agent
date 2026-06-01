import { AGENTS } from '../lib/agents'
import './HeroAgentArc.css'

const SHORT_LABELS: Record<string, string> = {
  warm: 'Warm',
  punchy: 'Punchy',
  formal: 'Formal',
  curious: 'Curious',
  urgent: 'Direct',
}

export function HeroAgentArc() {
  return (
    <div className="hero-arc" aria-hidden="true">
      <p className="hero-arc__caption">Pick your rep&apos;s voice</p>
      <div className="hero-arc__ring">
        {AGENTS.map((agent, index) => (
          <div
            key={agent.id}
            className={`hero-arc__item hero-arc__item--${index}`}
          >
            <div className="hero-arc__avatar-wrap">
              <img
                className="hero-arc__avatar"
                src={agent.image}
                alt=""
                width={index === 2 ? 88 : 72}
                height={index === 2 ? 88 : 72}
                loading="eager"
              />
            </div>
            <span className="hero-arc__label">{SHORT_LABELS[agent.id]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
