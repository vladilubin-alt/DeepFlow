import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

const CONTACT_EMAIL = 'privacy@deepflow.app';

export default function PrivacyPolicyScreen() {
  const { colours } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colours.backgroundBase }}>
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={{ fontSize: 22, color: colours.accentGold, fontWeight: '700', marginTop: 8, marginBottom: 4 }}>
          Privacy Policy
        </Text>
        <Text style={{ fontSize: 11, color: colours.textMuted, marginBottom: 24, fontFamily: 'monospace' }}>
          Effective date: June 28, 2026
        </Text>

        <Section title="1. Introduction" colours={colours}>
          <Body colours={colours}>
            DeepFlow ("we", "our", or "us") is an ADHD writing instrument built to help you write
            without distraction. This Privacy Policy explains what personal data we collect, how we use
            it, and your rights under applicable law including the GDPR (EU/EEA) and the CCPA (California).
          </Body>
        </Section>

        <Section title="2. Data We Collect" colours={colours}>
          <SubTitle title="2.1 Account Data" colours={colours} />
          <Bullet text="Email address — collected at sign-up, used for authentication." colours={colours} />
          <Bullet text="Password — stored as a salted bcrypt hash. We never see your plaintext password." colours={colours} />
          <Bullet text="User ID — a randomly generated UUID assigned to your account." colours={colours} />

          <SubTitle title="2.2 Writing & Session Data" colours={colours} />
          <Bullet text="Writing sessions — metadata (start time, duration, word count). We do not store the actual text you write unless you save it to the Vault." colours={colours} />
          <Bullet text="Vault entries — deleted writing fragments you choose to save." colours={colours} />
          <Bullet text="Focus scores — computed metrics about your session productivity." colours={colours} />

          <SubTitle title="2.3 Device & Technical Data" colours={colours} />
          <Bullet text="Device type / OS version — collected by RevenueCat and Mixpanel." colours={colours} />
          <Bullet text="Push notification token — stored only if you enable reminders." colours={colours} />
          <Body colours={colours}>
            Analytics are opt-in only. On first launch, you will be asked to accept or reject analytics tracking. If rejected, no events are sent.
          </Body>
        </Section>

        <Section title="3. How We Use Your Data" colours={colours}>
          <Bullet text="Authenticate you and secure your account (contract performance)." colours={colours} />
          <Bullet text="Save and sync your writing sessions across devices." colours={colours} />
          <Bullet text="Analyse feature usage to improve the product (legitimate interests)." colours={colours} />
          <Bullet text="Process subscription payments via RevenueCat." colours={colours} />
        </Section>

        <Section title="4. Third-Party Processors" colours={colours}>
          <Bullet text="Supabase — Database, Auth, Storage (US)" colours={colours} />
          <Bullet text="RevenueCat — Subscription management (US)" colours={colours} />
          <Bullet text="Superwall — Paywall & monetisation (US)" colours={colours} />
          <Bullet text="Mixpanel — Product analytics (US)" colours={colours} />
          <Bullet text="Netlify — Web hosting (US)" colours={colours} />
        </Section>

        <Section title="5. Data Retention" colours={colours}>
          <Bullet text="Account data — retained until you delete your account." colours={colours} />
          <Bullet text="Writing sessions & Vault — retained until you delete your account." colours={colours} />
          <Bullet text="Analytics events — retained for 24 months in Mixpanel." colours={colours} />
        </Section>

        <Section title="6. Your Rights" colours={colours}>
          <Body colours={colours}>Depending on your location, you may have the following rights:</Body>
          <Bullet text="Access — request a copy of your personal data." colours={colours} />
          <Bullet text="Erasure — request deletion of your account and all associated data." colours={colours} />
          <Bullet text="Portability — receive your data in a machine-readable format." colours={colours} />
          <Bullet text="Opt-out of sale (CCPA) — we do not sell personal information." colours={colours} />
          <Body colours={colours}>
            To exercise any right, email {CONTACT_EMAIL}.
          </Body>
        </Section>

        <Section title="7. Data Security" colours={colours}>
          <Bullet text="All data in transit is encrypted via TLS 1.2+." colours={colours} />
          <Bullet text="Row-Level Security (RLS) is enforced — each user can only access their own data." colours={colours} />
          <Bullet text="Auth tokens on mobile are stored in Android Keystore / iOS Keychain." colours={colours} />
          <Bullet text="Passwords are hashed with bcrypt by Supabase Auth." colours={colours} />
        </Section>

        <Section title="8. Contact" colours={colours}>
          <Body colours={colours}>
            For privacy questions, requests, or complaints, email {CONTACT_EMAIL}.
          </Body>
        </Section>

        <View style={{ borderTopWidth: 0.5, borderTopColor: colours.borderSubtle, marginTop: 24, paddingTop: 16 }}>
          <Text style={{ fontSize: 10, color: colours.textMuted, textAlign: 'center' }}>
            © 2026 DeepFlow. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children, colours }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 14, color: colours.textPrimary, fontWeight: '600', marginBottom: 8 }}>{title}</Text>
      {children}
    </View>
  );
}

function SubTitle({ title, colours }) {
  return <Text style={{ fontSize: 12, color: colours.textPrimary, fontWeight: '500', marginTop: 8, marginBottom: 4 }}>{title}</Text>;
}

function Body({ children, colours }) {
  return <Text style={{ fontSize: 12, color: colours.textMuted, lineHeight: 18, marginBottom: 8 }}>{children}</Text>;
}

function Bullet({ text, colours }) {
  return (
    <Text style={{ fontSize: 12, color: colours.textMuted, lineHeight: 18, marginBottom: 4, paddingLeft: 12 }}>
      {'• '}{text}
    </Text>
  );
}
