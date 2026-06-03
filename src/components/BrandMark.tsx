import { BRAND } from '../lib/branding'
import { NeoLogo } from './NeoLogo'
import './BrandMark.css'

interface BrandMarkProps {
  size?: 'sm' | 'md'
}

export function BrandMark({ size = 'md' }: BrandMarkProps) {
  const iconPx = size === 'sm' ? 30 : 38

  return (
    <div className={`brand-mark brand-mark--${size}`} aria-label={BRAND.name}>
      <span className="brand-mark__icon" aria-hidden="true">
        <NeoLogo size={iconPx} className="brand-mark__logo" />
      </span>
      <div className="brand-mark__text">
        <span className="brand-mark__name">{BRAND.name}</span>
        {size === 'md' && (
          <span className="brand-mark__tagline">{BRAND.shortTagline}</span>
        )}
      </div>
    </div>
  )
}
