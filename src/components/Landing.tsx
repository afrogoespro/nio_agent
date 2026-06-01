import { LandingNav } from './LandingNav'
import { HeroAgentArc } from './HeroAgentArc'
import { HowItWorksScroll } from './HowItWorksScroll'
import { ChannelsRoadmap } from './ChannelsRoadmap'
import './Landing.css'

interface LandingProps {
  onTry: () => void
}

export function Landing({ onTry }: LandingProps) {
  return (
    <div className="landing">
      <LandingNav onTry={onTry} />

      <header className="landing__hero">
        <div className="landing__fold">
          <h1 className="landing__headline">
            A sales rep working for you around the clock.
          </h1>

          <p className="landing__subhead">
            We find who to email, write your messages, and map your follow ups.
            Try it free in under five minutes.
          </p>

          <div className="landing__actions">
            <button type="button" className="landing__cta" onClick={onTry}>
              Ok, let&apos;s try it
            </button>
          </div>

          <div className="landing__visual" aria-label="Pick your rep voice">
            <HeroAgentArc showCaption={false} size="large" />
          </div>
        </div>
      </header>

      <HowItWorksScroll />

      <ChannelsRoadmap />

      <footer className="landing__footer">
        <p>Five steps from zero to launch.</p>
        <button type="button" className="landing__cta" onClick={onTry}>
          Ok, let&apos;s try it
        </button>
      </footer>
    </div>
  )
}
