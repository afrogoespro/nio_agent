import { AGENTS } from '../lib/agents'
import './HeroAgentArc.css'

const SHORT_LABELS: Record<string, string> = {
  warm: 'Warm',
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
  const sizeClass = size === 'large' ? ' hero-arc--large' : ''
  return (
    <div
      className={`hero-arc${showCaption ? '' : ' hero-arc--compact'}${sizeClass}`}
    >
      {showCaption && (
        <p className="hero-arc__caption">Pick your rep&apos;s voice</p>
      )}
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
                width={index === 2 ? (size === 'large' ? 108 : 84) : size === 'large' ? 92 : 68}
                height={index === 2 ? (size === 'large' ? 108 : 84) : size === 'large' ? 92 : 68}
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
