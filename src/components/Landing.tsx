import { BRAND } from '../lib/branding'
import { BrandMark } from './BrandMark'
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
        <p className="landing__badge">{BRAND.shortTagline} · {BRAND.setupLine}</p>
        <h1 className="landing__headline">
          A sales rep working for you around the clock.
        </h1>
        <p className="landing__lede">
          Try it free: tell us about you, who you want to reach, get your plan, then
          launch. Most people finish in under five minutes.
        </p>
        <div className="landing__actions">
          <button type="button" className="landing__cta" onClick={onTry}>
            Ok, let&apos;s try it
          </button>
          <a href="#how-it-works" className="landing__secondary">
            See the steps
          </a>
          <a href="#channels" className="landing__secondary">
            Channels
          </a>
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
