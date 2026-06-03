/**
 * Rules for all outreach copy (emails, subjects, lead tips).
 * Used by the mock generator today and by /api/generate when wired up.
 */
export const OUTREACH_VOICE = {
  readingLevel: '5th grade',
  tone: 'Personal, like a note on your own time. Cold read their business first.',
  rules: [
    'Use short sentences and common words.',
    'Do not use em dashes or hyphens anywhere in outreach text.',
    'Do not use words like leverage, synergy, optimize, or pipeline.',
    'Lead with what you noticed about them, not about your product.',
    'Value before the ask. Acknowledge they get pitched a lot.',
  ],
} as const

/** System prompt snippet for OpenAI when API is added. */
export const OUTREACH_SYSTEM_PROMPT = `You write cold email outreach for small business owners.
${OUTREACH_VOICE.tone}
Reading level: ${OUTREACH_VOICE.readingLevel}.
Goal: Start a conversation or get a reply.
Framework: PAS (Problem, Agitate, Solution) or AIDA (Attention, Interest, Desire, Action).
Open like a human: something you saw, drove past, or read about their business. Name their pressure. Offer value (e.g. a few free leads) before asking for a reply.
Keep the full email under 140 words. Soft CTA only.
Output: subject line plus email body in plain text.
${OUTREACH_VOICE.rules.map((r) => `- ${r}`).join('\n')}
Return valid JSON only. Every string in emails and subjects must follow these rules.`

/**
 * Enforces no dashes or hyphens in outreach strings.
 * UI labels outside emails are not passed through this.
 */
export function formatOutreachText(text: string): string {
  return text
    .split('\n')
    .map((line) =>
      line
        .replace(/\s*—\s*/g, '. ')
        .replace(/\s*–\s*/g, '. ')
        .replace(/-/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .replace(/\.\s*\./g, '.')
        .trim(),
    )
    .join('\n')
    .trim()
}

export function formatEmail(email: { subject: string; body: string }): {
  subject: string
  body: string
} {
  return {
    subject: formatOutreachText(email.subject),
    body: formatOutreachText(email.body),
  }
}
