import type { VercelRequest, VercelResponse } from '@vercel/node'

interface Body {
  to?: string
  subject?: string
  body?: string
  fromName?: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return res.status(503).json({
      error:
        'Email send is not set up yet. Add RESEND_API_KEY in Vercel project settings.',
    })
  }

  const { to, subject, body, fromName } = req.body as Body
  if (!to?.includes('@') || !subject || !body) {
    return res.status(400).json({ error: 'Missing to, subject, or body.' })
  }

  const from = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
  const fromLabel = fromName?.trim() || 'AlwaysOn Rep'

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${fromLabel} <${from}>`,
        to: [to],
        subject: formatOutreach(subject),
        text: formatOutreach(body),
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return res.status(502).json({ error: err || 'Resend API error' })
    }

    return res.status(200).json({
      message: `Test email sent to ${to}. Check your inbox.`,
    })
  } catch {
    return res.status(500).json({ error: 'Could not send email.' })
  }
}

function formatOutreach(text: string): string {
  return text.replace(/\s*—\s*/g, '. ').replace(/-/g, ' ')
}
