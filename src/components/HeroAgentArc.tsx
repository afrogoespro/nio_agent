import { AGENTS } from '../lib/agents'
import './HeroAgentArc.css'

const SHORT_LABELS: Record<string, string> = {
  warm: 'Warm',
  relatable: 'Relatable',
  punchy: 'Punchy',
  formal: 'Formal',
  curious: 'Curious',
  urgent: 'Direct',
}

interface HeroAgentArcProps {
  showCaption?: boolean
  size?: 'default' | 'large'
}

export function HeroAgentArc({
  showCaption = true,
  size = 'default',
}: HeroAgentArcProps) {
  const sizeClass = size === 'large' ? ' hero-arc--large hero-arc--circle' : ''
  return (
    <div
      className={`hero-arc${showCaption ? '' : ' hero-arc--compact'}${sizeClass}`}
    >
      {showCaption && (
        <p className="hero-arc__caption">Pick your rep&apos;s voice</p>
      )}
      <div className="hero-arc__ring">
        {AGENTS.map((agent) => (
          <div key={agent.id} className="hero-arc__item">
            <div className="hero-arc__avatar-wrap">
              <img
                className="hero-arc__avatar"
                src={agent.image}
                alt=""
                width={size === 'large' ? 88 : 72}
                height={size === 'large' ? 88 : 72}
                loading="eager"
                decoding="async"
              />
            </div>
            <span className="hero-arc__label">{SHORT_LABELS[agent.id]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
