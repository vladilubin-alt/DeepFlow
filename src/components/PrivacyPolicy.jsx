import React from 'react';
import { Link } from 'react-router-dom';

const EFFECTIVE_DATE = 'June 28, 2026';
const CONTACT_EMAIL = 'privacy@deepflow.app';
const APP_NAME = 'DeepFlow';

export default function PrivacyPolicy() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#ccc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      lineHeight: 1.75,
    }}>
      {/* Header bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        backgroundColor: '#0a0a0aee',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1f1f1f',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 50,
      }}>
        <span style={{ color: '#EF9F27', fontWeight: 700, fontSize: 18, letterSpacing: -0.3 }}>
          DeepFlow
        </span>
        <Link
          to="/"
          style={{
            color: '#888',
            fontSize: 13,
            textDecoration: 'none',
            border: '1px solid #333',
            borderRadius: 8,
            padding: '6px 14px',
          }}
        >
          ← Back to App
        </Link>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>
        <h1 style={{ color: '#EF9F27', fontSize: 32, fontWeight: 700, marginBottom: 8, letterSpacing: -0.5 }}>
          Privacy Policy
        </h1>
        <p style={{ color: '#666', fontSize: 13, marginBottom: 40, fontFamily: 'monospace' }}>
          Effective date: {EFFECTIVE_DATE} · Last updated: {EFFECTIVE_DATE}
        </p>

        <Section title="1. Introduction">
          <p>
            {APP_NAME} ("we", "our", or "us") is an ADHD writing instrument built to help you write
            without distraction. This Privacy Policy explains what personal data we collect, how we use
            it, and your rights under applicable law including the GDPR (EU/EEA) and the CCPA (California).
          </p>
          <p>
            By creating an account or using the {APP_NAME} app or website, you agree to the practices
            described in this policy. If you disagree, please do not use our services.
          </p>
        </Section>

        <Section title="2. Data We Collect">
          <SubSection title="2.1 Account Data">
            <ul>
              <li><strong>Email address</strong> — collected at sign-up, used for authentication and transactional emails.</li>
              <li><strong>Password</strong> — stored as a salted bcrypt hash by Supabase Auth. We never see your plaintext password.</li>
              <li><strong>User ID</strong> — a randomly generated UUID assigned to your account.</li>
            </ul>
          </SubSection>

          <SubSection title="2.2 Writing &amp; Session Data">
            <ul>
              <li><strong>Writing sessions</strong> — session metadata (start time, duration, word count, timer preset, FLARE type). We do <em>not</em> store the actual text you write unless you explicitly save it to the Vault.</li>
              <li><strong>Vault entries</strong> — deleted writing fragments you choose to save ("graveyard"). These are end-to-end owned by your account and subject to RLS (Row-Level Security).</li>
              <li><strong>Focus scores</strong> — computed metrics about your session productivity.</li>
              <li><strong>Streak data</strong> — consecutive days of writing activity.</li>
            </ul>
          </SubSection>

          <SubSection title="2.3 Device &amp; Technical Data">
            <ul>
              <li><strong>IP address</strong> — logged transiently by our infrastructure; not stored long-term.</li>
              <li><strong>Device type / OS version</strong> — collected by RevenueCat and Mixpanel for analytics and subscription management (see §4).</li>
              <li><strong>App version</strong> — used for crash reporting and compatibility checks.</li>
              <li><strong>Push notification token</strong> — stored only if you enable reminders (Android only).</li>
            </ul>
          </SubSection>

          <SubSection title="2.4 Usage Analytics">
            <p>
              We collect anonymised event data (e.g. "Session Started", "Grace Token Used") via
              Mixpanel to understand how features are used. Events contain your user ID and
              session metadata but <strong>never</strong> the content of your writing.
            </p>
          </SubSection>
        </Section>

        <Section title="3. How We Use Your Data">
          <table style={tableStyle}>
            <thead>
              <tr>
                <Th>Purpose</Th>
                <Th>Legal Basis (GDPR)</Th>
              </tr>
            </thead>
            <tbody>
              <Tr cols={['Authenticate you and secure your account', 'Contract performance']} />
              <Tr cols={['Save and sync your writing sessions across devices', 'Contract performance']} />
              <Tr cols={['Send transactional emails (e.g. email confirmation, password reset)', 'Contract performance']} />
              <Tr cols={['Analyse feature usage to improve the product', 'Legitimate interests']} />
              <Tr cols={['Process subscription payments via RevenueCat', 'Contract performance']} />
              <Tr cols={['Comply with legal obligations (e.g. tax records)', 'Legal obligation']} />
            </tbody>
          </table>
        </Section>

        <Section title="4. Third-Party Processors">
          <p>
            We engage the following sub-processors. Each is bound by a Data Processing Agreement:
          </p>
          <table style={tableStyle}>
            <thead>
              <tr>
                <Th>Processor</Th>
                <Th>Purpose</Th>
                <Th>Data Transferred</Th>
                <Th>Location</Th>
              </tr>
            </thead>
            <tbody>
              <Tr cols={['Supabase', 'Database, Auth, Storage', 'All account & session data', 'US (AWS us-east-1)']} />
              <Tr cols={['RevenueCat', 'Subscription management', 'User ID, device info, purchase events', 'US']} />
              <Tr cols={['Superwall', 'Paywall & monetisation', 'User ID, device info', 'US']} />
              <Tr cols={['Mixpanel', 'Product analytics', 'User ID, anonymised events', 'US']} />
              <Tr cols={['Netlify', 'Web hosting', 'IP addresses (logs)', 'US']} />
            </tbody>
          </table>
          <p style={{ marginTop: 16, fontSize: 13, color: '#666' }}>
            For EU/EEA users, data transfers to the US are covered by Standard Contractual Clauses (SCCs).
          </p>
        </Section>

        <Section title="5. Data Retention">
          <ul>
            <li><strong>Account data</strong> — retained until you delete your account.</li>
            <li><strong>Writing sessions &amp; Vault</strong> — retained until you delete your account or manually delete individual entries.</li>
            <li><strong>Analytics events</strong> — retained for 24 months in Mixpanel, then automatically purged.</li>
            <li><strong>Server logs</strong> — retained for up to 30 days by Netlify and Supabase.</li>
          </ul>
        </Section>

        <Section title="6. Your Rights">
          <p>Depending on your location, you may have the following rights:</p>
          <ul>
            <li><strong>Access</strong> — request a copy of your personal data.</li>
            <li><strong>Rectification</strong> — correct inaccurate data.</li>
            <li><strong>Erasure</strong> — request deletion of your account and all associated data.</li>
            <li><strong>Portability</strong> — receive your data in a machine-readable format.</li>
            <li><strong>Restriction</strong> — ask us to pause processing while a dispute is resolved.</li>
            <li><strong>Objection</strong> — object to processing based on legitimate interests.</li>
            <li><strong>Opt-out of sale (CCPA)</strong> — we do <em>not</em> sell personal information.</li>
          </ul>
          <p>
            To exercise any right, email <a href={`mailto:${CONTACT_EMAIL}`} style={linkStyle}>{CONTACT_EMAIL}</a>.
            We will respond within 30 days (or 45 days for complex requests).
          </p>
        </Section>

        <Section title="7. Data Security">
          <p>
            We implement the following technical measures:
          </p>
          <ul>
            <li>All data in transit is encrypted via TLS 1.2+.</li>
            <li>Data at rest is encrypted via AES-256 (Supabase / AWS).</li>
            <li>Row-Level Security (RLS) is enforced in Supabase — each user can only access their own data.</li>
            <li>Auth tokens on mobile devices are stored in Android Keystore / iOS Keychain (encrypted at rest).</li>
            <li>Passwords are hashed with bcrypt by Supabase Auth.</li>
          </ul>
          <p>
            Despite our efforts, no system is completely secure. If you discover a vulnerability, please
            disclose it responsibly to <a href={`mailto:${CONTACT_EMAIL}`} style={linkStyle}>{CONTACT_EMAIL}</a>.
          </p>
        </Section>

        <Section title="8. Children's Privacy">
          <p>
            {APP_NAME} is not directed at children under 13 (or 16 in the EU). We do not knowingly
            collect personal data from children. If you believe a child has created an account,
            contact us immediately and we will delete it.
          </p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>
            We may update this policy from time to time. We will notify registered users via email
            at least 14 days before any material changes take effect. The effective date at the top
            of this page will always reflect the latest version.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>
            For privacy questions, requests, or complaints:<br />
            <strong>Email:</strong> <a href={`mailto:${CONTACT_EMAIL}`} style={linkStyle}>{CONTACT_EMAIL}</a><br />
            <strong>App:</strong> DeepFlow ADHD Writing Instrument
          </p>
          <p>
            If you are in the EU/EEA and are unsatisfied with our response, you have the right to
            lodge a complaint with your local Data Protection Authority.
          </p>
        </Section>

        <div style={{ borderTop: '1px solid #1f1f1f', marginTop: 48, paddingTop: 24, fontSize: 12, color: '#444' }}>
          © 2026 DeepFlow. All rights reserved.
          {' · '}
          <Link to="/" style={{ color: '#666', textDecoration: 'none' }}>Back to app</Link>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ color: '#e5e5e5', fontSize: 18, fontWeight: 600, marginBottom: 16, borderBottom: '1px solid #1f1f1f', paddingBottom: 8 }}>
        {title}
      </h2>
      <div style={{ color: '#aaa', fontSize: 14 }}>{children}</div>
    </section>
  );
}

function SubSection({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ color: '#ccc', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{title}</h3>
      {children}
    </div>
  );
}

function Th({ children }) {
  return (
    <th style={{ textAlign: 'left', padding: '8px 12px', color: '#888', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #222' }}>
      {children}
    </th>
  );
}

function Tr({ cols }) {
  return (
    <tr>
      {cols.map((c, i) => (
        <td key={i} style={{ padding: '8px 12px', fontSize: 13, color: '#aaa', borderBottom: '1px solid #1a1a1a', verticalAlign: 'top' }}>
          {c}
        </td>
      ))}
    </tr>
  );
}

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  border: '1px solid #222',
  borderRadius: 8,
  overflow: 'hidden',
  fontSize: 13,
};

const linkStyle = {
  color: '#EF9F27',
  textDecoration: 'none',
};
