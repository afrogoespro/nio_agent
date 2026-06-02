import { LandingNav } from './LandingNav'
import { HeroAgentArc } from './HeroAgentArc'
import { HowItWorksScroll } from './HowItWorksScroll'
import { ChannelsRoadmap } from './ChannelsRoadmap'
import './Landing.css'

interface LandingProps {
  onTry: () => void
  onPrivacy: () => void
}

export function Landing({ onTry, onPrivacy }: LandingProps) {
  return (
    <div className="landing">
      <LandingNav onTry={onTry} onPrivacy={onPrivacy} />

      <header className="landing__hero">
        <div className="landing__fold">
          <p className="landing__eyebrow">Neo · Natural Intelligent Outreach</p>
          <h1 className="landing__headline">
            Your Neo Rep works outreach around the clock.
          </h1>

          <p className="landing__subhead">
            Neo finds who to email, writes your messages, and maps your follow ups.
            Try it free in under five minutes.
          </p>

          <div className="landing__actions">
            <button type="button" className="landing__cta" onClick={onTry}>
              Ok, let&apos;s try it
            </button>
          </div>

          <div className="landing__visual" aria-label="Pick your Neo Rep voice">
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
        <p className="landing__legal">
          <button type="button" className="landing__legal-link" onClick={onPrivacy}>
            Privacy Policy
          </button>
        </p>
      </footer>
    </div>
  )
}
