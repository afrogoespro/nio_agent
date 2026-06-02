import { BrandMark } from './BrandMark'
import './PrivacyPolicy.css'

interface PrivacyPolicyProps {
  onBack: () => void
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <div className="privacy">
      <header className="privacy__header">
        <button type="button" className="privacy__back" onClick={onBack}>
          ← Back
        </button>
        <BrandMark size="sm" />
      </header>

      <main className="privacy__main">
        <h1>Privacy Policy</h1>
        <p className="privacy__updated">Last updated: June 2, 2026</p>

        <p>
          AlwaysOn Rep (&quot;we,&quot; &quot;us&quot;) helps you build outreach plans. This
          policy explains what we collect, how we use it, and your choices.
        </p>

        <section>
          <h2>What we collect</h2>
          <ul>
            <li>
              <strong>Wizard answers</strong> — what you type about your business, customers,
              and location so we can build your plan.
            </li>
            <li>
              <strong>Session data</strong> — your plan may be stored in your browser session
              until you close the tab or start over.
            </li>
            <li>
              <strong>Apollo (optional)</strong> — if you connect Apollo or we use a server
              key, we send search terms to Apollo to find example leads. We do not store your
              Apollo password on our servers if you paste a key; it stays in your browser
              session for that visit.
            </li>
            <li>
              <strong>Email tests (optional)</strong> — if you send a test email from Launch,
              we pass the message to our email provider (Resend) using the address you provide.
            </li>
          </ul>
        </section>

        <section>
          <h2>What we do not do</h2>
          <ul>
            <li>We do not sell your personal information.</li>
            <li>We do not send cold email on your behalf without you copying and sending it yourself.</li>
            <li>We do not require an account to try the product.</li>
          </ul>
        </section>

        <section>
          <h2>How we use information</h2>
          <p>
            We use your inputs to generate sample leads, email copy, and follow up ideas. Our
            hosting (Vercel) and tools (Apollo, Resend) process data only to run the service.
          </p>
        </section>

        <section>
          <h2>Third parties</h2>
          <ul>
            <li>
              <strong>Vercel</strong> — hosts the app and API.
            </li>
            <li>
              <strong>Apollo.io</strong> — lead search when enabled.
            </li>
            <li>
              <strong>Resend</strong> — test email delivery when enabled.
            </li>
          </ul>
          <p>Each provider has its own privacy policy.</p>
        </section>

        <section>
          <h2>Retention</h2>
          <p>
            Plans in your browser session are cleared when you start over or close the browser.
            We do not keep a permanent copy of your wizard answers unless you sign up for a
            saved account (when that feature is available).
          </p>
        </section>

        <section>
          <h2>Your choices</h2>
          <ul>
            <li>Do not enter real customer names if you are only testing.</li>
            <li>Use Start over to clear your session plan.</li>
            <li>Do not connect Apollo or send test emails if you prefer not to share data with those services.</li>
          </ul>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Questions about this policy? Email{' '}
            <a href="mailto:support@alwaysonrep.com">support@alwaysonrep.com</a> (update this
            address to your real support email).
          </p>
        </section>
      </main>
    </div>
  )
}
