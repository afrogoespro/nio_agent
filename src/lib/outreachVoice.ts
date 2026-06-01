/**
 * Rules for all outreach copy (emails, subjects, lead tips).
 * Used by the mock generator today and by /api/generate when wired up.
 */
export const OUTREACH_VOICE = {
  readingLevel: '5th grade',
  tone: 'Simple and helpful. Not pushy. No sales talk.',
  rules: [
    'Use short sentences and common words.',
    'Do not use em dashes or hyphens anywhere in outreach text.',
    'Do not use words like leverage, synergy, optimize, or pipeline.',
    'One clear ask per email. No fake urgency.',
    'Write like you are talking to a friend at work.',
  ],
} as const

/** System prompt snippet for OpenAI when API is added. */
export const OUTREACH_SYSTEM_PROMPT = `You write cold email outreach for small business owners.
${OUTREACH_VOICE.tone}
Reading level: ${OUTREACH_VOICE.readingLevel}.
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
