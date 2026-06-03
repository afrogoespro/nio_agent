export type IndustryId =
  | 'dental'
  | 'restaurant'
  | 'property'
  | 'healthcare'
  | 'professional_services'
  | 'retail'
  | 'corporate_ops'
  | 'general'

export interface IndustryContext {
  id: IndustryId
  label: string
}

/** B2B pain points only — written for the buyer's business, not end consumers. */
const PAIN_POINTS: Record<IndustryId, string[]> = {
  dental: [
    'New patient calls stall when follow-up after inquiries is inconsistent.',
    'Front desk time gets eaten by insurance calls instead of filling the schedule.',
    'Competing practices win the same zip code on Google and review sites.',
    'Reactivation lists for hygiene visits go cold without a light outreach rhythm.',
  ],
  restaurant: [
    'Covers swing week to week, which makes labor and ordering harder to plan.',
    'Catering and event leads go cold when nobody follows up after the first quote.',
    'Chains and delivery apps squeeze margin on the same neighborhood traffic.',
    'Promos only work when the team can actually answer and book fast.',
  ],
  property: [
    'Vacancy and turnover hit NOI when inquiries are not qualified quickly.',
    'Owners expect faster updates on maintenance and leasing questions.',
    'Marketing spend underperforms when listings attract the wrong tenant profile.',
    'Broker and vendor partners need steady touchpoints or referrals fade.',
  ],
  healthcare: [
    'Schedule gaps appear when reminders and recall outreach are sporadic.',
    'Intake and billing questions pile up on a small front-office team.',
    'Prospective patients compare three options online before they ever call.',
    'Prior auth and payer delays slow cash flow even when demand is there.',
  ],
  professional_services: [
    'Pipeline depends on partner intros that nobody nurtures on a schedule.',
    'Buyers compare firms on proof (case studies, reviews) before taking a meeting.',
    'Delivery is busy but new logos still ride on founder-led sales.',
    'Proposals go quiet when follow-up stops after the first send.',
  ],
  retail: [
    'Traffic and basket size swing, which makes staffing and inventory bets risky.',
    'Repeat buyers only hear from the brand during promos, not between visits.',
    'Price-matching and marketplaces pressure margin on core SKUs.',
    'Local partnerships and B2B accounts are underdeveloped for steady volume.',
  ],
  corporate_ops: [
    'Multiple vendors for facilities and supplies create approval drag and invoice noise.',
    'Managers need clear ROI before they sign or renew a service contract.',
    'Teams lose hours coordinating vendors instead of running the floor.',
    'Budget cycles mean deals stall unless you catch them before planning locks.',
  ],
  general: [
    'Growth still leans on referrals, which go quiet when nobody owns outreach.',
    'Owners stay stuck in admin instead of sales and account conversations.',
    'Slower follow-up means competitors take deals that were warm.',
    'Marketing spend is hard to defend without a measurable reply path.',
  ],
}

const CONSUMER_PHRASES =
  /\b(dog|pet|cat|guilt|walk|homeowner|consumer|family|kids|personal|hobby)\b/i

/** Infer industry from the lead's company + title (B2B buyer context), not your offer. */
export function inferLeadIndustryContext(fields: {
  companyName: string
  title: string
  idealCustomer: string
}): IndustryContext {
  const blob = [fields.companyName, fields.title, fields.idealCustomer]
    .join(' ')
    .toLowerCase()

  if (/dental|dentist|orthodont|grins|hygien/.test(blob)) {
    return { id: 'dental', label: 'dental practices' }
  }
  if (/restaurant|cafe|café|food service|bistro|hospitality/.test(blob)) {
    return { id: 'restaurant', label: 'restaurants and hospitality' }
  }
  if (/property|real estate|landlord|leasing|facility|facilities/.test(blob)) {
    return { id: 'property', label: 'property and facilities' }
  }
  if (/clinic|medical|health|therapy|chiro|hospital/.test(blob)) {
    return { id: 'healthcare', label: 'healthcare organizations' }
  }
  if (
    /office depot|staples|supply|logistics|warehouse|corporate|inc\.|llc|enterprise|saas|software|consult|agency|marketing|legal|account|tech|b2b/.test(
      blob,
    )
  ) {
    return { id: 'corporate_ops', label: 'operations and procurement teams' }
  }
  if (/law|legal|account|design|studio|advisor|insurance/.test(blob)) {
    return { id: 'professional_services', label: 'professional services firms' }
  }
  if (
    /retail|store|shop|boutique|ecommerce|e-commerce|manager|director|vp|head of|chief/.test(
      blob,
    )
  ) {
    return { id: 'retail', label: 'retail and multi-location operators' }
  }
  return { id: 'general', label: 'growing businesses' }
}

function pickPains(pool: string[], seed: string, avoidText: string): [string, string] {
  const avoid = avoidText.toLowerCase()
  const filtered = pool.filter((p) => {
    if (CONSUMER_PHRASES.test(p)) return false
    const words = p.toLowerCase().split(/\s+/).filter((w) => w.length > 5)
    return !words.some((w) => avoid.includes(w))
  })
  const list = filtered.length >= 2 ? filtered : pool.filter((p) => !CONSUMER_PHRASES.test(p))

  let idx = 0
  for (let i = 0; i < seed.length; i++) idx = (idx + seed.charCodeAt(i)) % list.length
  const primary = list[idx] ?? list[0]
  const secondary = list[(idx + 1) % list.length] ?? list[0]
  return [primary, secondary]
}

/** B2B reasons tied to the lead's role and company — never echoes the seller's wizard "why". */
export function buildLeadWhyFit(input: {
  idealCustomer: string
  business: string
  whyTarget: string
  companyName: string
  title: string
  place: string
  area: string
  seed: string
}): string[] {
  const industry = inferLeadIndustryContext({
    companyName: input.companyName,
    title: input.title,
    idealCustomer: input.idealCustomer,
  })

  const avoidEcho = `${input.whyTarget} ${input.business}`
  const [primary, secondary] = pickPains(PAIN_POINTS[industry.id], input.seed, avoidEcho)

  const roleLabel = input.title.trim() || 'decision maker'
  const company = input.companyName.trim() || 'their company'

  const lines = [
    `Works at ${company} as ${roleLabel}`,
    input.place
      ? `Based in ${input.place}`
      : `In your target area: ${input.area}`,
    `Why they're a fit: As a ${roleLabel}, they often deal with ${primary.charAt(0).toLowerCase()}${primary.slice(1)}`,
  ]

  if (secondary !== primary) {
    lines.push(
      `Also common in ${industry.label}: ${secondary.charAt(0).toLowerCase()}${secondary.slice(1)}`,
    )
  }

  return lines
}
