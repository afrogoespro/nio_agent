import { BRAND } from '../lib/branding'
import { BrandMark } from './BrandMark'
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
      <nav className="landing__nav">
        <BrandMark />
      </nav>

      <header className="landing__hero">
        <p className="landing__badge">
          {BRAND.shortTagline} · Easy setup · Under 5 minutes
        </p>

        <HeroAgentArc />

        <h1 className="landing__headline">
          A sales rep working for you around the clock.
        </h1>

        <p className="landing__tagline">
          Find who to email · Get messages written · Launch in minutes
        </p>

        <p className="landing__lede">
          Tell us about you and who you want to reach. We find a real person to
          contact, write your emails, and map your follow ups. No signup needed to
          see your plan.
        </p>

        <div className="landing__actions">
          <button type="button" className="landing__cta" onClick={onTry}>
            Ok, let&apos;s try it
          </button>
          <a href="#how-it-works" className="landing__secondary">
            See the steps
          </a>
        </div>

        <ul className="landing__bullets">
          <li>Find who to email</li>
          <li>Emails written in your voice</li>
          <li>Ready to launch in minutes</li>
        </ul>
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
