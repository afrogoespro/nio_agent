import { SOCIAL_CHANNELS } from '../types/integrations'
import './ChannelsRoadmap.css'

export function ChannelsRoadmap() {
  return (
    <section className="channels" id="channels" aria-labelledby="channels-title">
      <h2 id="channels-title" className="channels__title">
        Channels we are wiring up
      </h2>
      <p className="channels__lede">
        Email and Apollo work first. Social outreach is on the roadmap.
      </p>
      <ul className="channels__list">
        <li className="channels__item channels__item--live">
          <ChannelIcon id="email" />
          <span className="channels__name">Email</span>
          <span className="channels__badge channels__badge--live">Now</span>
        </li>
        <li className="channels__item channels__item--live">
          <ChannelIcon id="apollo" />
          <span className="channels__name">Apollo</span>
          <span className="channels__badge channels__badge--live">Now</span>
        </li>
        {SOCIAL_CHANNELS.map((ch) => (
          <li key={ch.id} className="channels__item">
            <ChannelIcon id={ch.id} />
            <span className="channels__name">{ch.name}</span>
            <span className="channels__badge">Soon</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ChannelIcon({ id }: { id: string }) {
  const className = 'channels__icon'
  switch (id) {
    case 'email':
      return (
        <span className={className} aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </span>
      )
    case 'apollo':
      return (
        <span className={className} aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </span>
      )
    case 'linkedin':
      return (
        <span className={className} aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </span>
      )
    case 'x':
      return (
        <span className={className} aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </span>
      )
    case 'instagram':
      return (
        <span className={className} aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          </svg>
        </span>
      )
    default:
      return null
  }
}
