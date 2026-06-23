import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colours } from '../theme/colours';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colours.backgroundBase }}>
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={{ fontSize: 13, color: colours.textPrimary, fontWeight: '500', marginTop: 8, marginBottom: 16 }}>Settings</Text>

        <Section title="App">
          <Row label="Sensory audio" value="Off (coming soon)" />
          <Row label="Haptic feedback" value="On" />
          <Row label="Sound effects" value="On" />
        </Section>

        <Section title="Account">
          <Row label="Sync status" value="Supabase connected" />
          <Row label="Anonymous ID" value="Active" />
        </Section>

        <Section title="Session">
          <Row label="Idle threshold" value="5s" />
          <Row label="Guillotine fuse" value="10s" />
          <Row label="Danger border" value="Enabled" />
        </Section>

        <Section title="About">
          <Row label="Version" value="0.1.0" />
          <Row label="Build" value="React Native" />
          <Row label="Data" value="Local-first + Supabase" />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 9, color: colours.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>{title}</Text>
      <View style={{ backgroundColor: colours.backgroundSurface, borderRadius: 8, overflow: 'hidden' }}>{children}</View>
    </View>
  );
}

function Row({ label, value }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: colours.backgroundRaised }}>
      <Text style={{ fontSize: 12, color: colours.textPrimary }}>{label}</Text>
      <Text style={{ fontSize: 10, color: colours.textMuted }}>{value}</Text>
    </View>
  );
}
