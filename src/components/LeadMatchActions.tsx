import { ValidateInfo } from './ValidateInfo'
import { getUserTier, type UserTier } from '../lib/userTier'
import './LeadMatchActions.css'

interface LeadMatchActionsProps {
  leadName: string
  approved: boolean
  onPerfect: () => void
  onValidate: () => void
  onFindMore: () => void
}

export function LeadMatchActions({
  leadName,
  approved,
  onPerfect,
  onValidate,
  onFindMore,
}: LeadMatchActionsProps) {
  const tier = getUserTier()
  const first = leadName.split(' ')[0] ?? 'them'

  return (
    <div className="lead-match">
      <p className="lead-match__prompt">
        {approved
          ? 'Great. Neo will use this profile as the template.'
          : `Does ${first} look like the kind of person you want to reach?`}
      </p>

      <div className="lead-match__actions">
        {tier === 'trial' ? (
          <button type="button" className="lead-match__primary" onClick={onPerfect}>
            Perfect
          </button>
        ) : (
          <>
            <button type="button" className="lead-match__primary" onClick={onValidate}>
              Validate this match
            </button>
            <button type="button" className="lead-match__secondary" onClick={onFindMore}>
              Find more like {first}
            </button>
          </>
        )}
      </div>

      {tier === 'premium' && (
        <p className="lead-match__premium-note">
          <ValidateInfo /> Premium runs quiet tests, then ships the winning opener.
        </p>
      )}

      {tier === 'trial' && (
        <p className="lead-match__trial-note">
          Trial: one example lead to preview your plan. Upgrade later for Validate and
          scale.
        </p>
      )}
    </div>
  )
}

export function tierLabel(tier: UserTier): string {
  return tier === 'premium' ? 'Premium' : 'Trial'
}
