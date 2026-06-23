import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { triggerGraceTokenPaywall } from '../services/SuperwallService';
import { track } from '../services/AnalyticsService';

const MOCK_VAULT = [
  { id: '1', title: 'Untitled draft', failedAt: new Date(Date.now() - 30 * 60 * 1000), wordCount: 145, recovered: false },
  { id: '2', title: 'Morning pages', failedAt: new Date(Date.now() - 6 * 3600 * 1000), wordCount: 320, recovered: false },
  { id: '3', title: 'Project notes', failedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000), wordCount: 89, recovered: false },
  { id: '4', title: 'Old draft', failedAt: new Date(Date.now() - 40 * 24 * 3600 * 1000), wordCount: 500, recovered: false },
];

function timeAgo(date) {
  const hours = Math.floor((Date.now() - date.getTime()) / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function VaultScreen() {
  const { colours } = useTheme();
  const [vault, setVault] = useState(MOCK_VAULT);
  const [graceTokens, setGraceTokens] = useState(3);

  function costInfo(failedAt) {
    const hoursAgo = (Date.now() - failedAt.getTime()) / 3600000;
    if (hoursAgo < 1) return { badge: '50 tokens', colour: colours.stateSuccess, label: 'paid' };
    if (hoursAgo < 168) return { badge: '$0.99', colour: colours.accentGold, label: 'paid' };
    if (hoursAgo < 720) return { badge: '$1.99', colour: colours.stateDangerMuted, label: 'paid' };
    return { badge: 'gone', colour: '#2a2510', label: 'expired' };
  }

  const handleRecover = (id) => {
    const item = vault.find((v) => v.id === id);
    if (!item || item.recovered) return;
    const cost = costInfo(item.failedAt);
    if (cost.label === 'expired') return;
    if (graceTokens > 0) {
      setGraceTokens((t) => t - 1);
      setVault((prev) => prev.map((v) => v.id === id ? { ...v, recovered: true } : v));
      track('Vault Recovered', { wordCount: item.wordCount, method: 'grace_token' });
    } else {
      triggerGraceTokenPaywall(() => {
        setGraceTokens((t) => t + 3);
        setVault((prev) => prev.map((v) => v.id === id ? { ...v, recovered: true } : v));
        track('Vault Recovered', { wordCount: item.wordCount, method: 'paywall' });
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colours.backgroundBase }}>
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={{ fontSize: 13, color: colours.textPrimary, fontWeight: '500', marginTop: 8, marginBottom: 2 }}>Vault</Text>
        <Text style={{ fontSize: 9, color: colours.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
          Failed drafts · tap to recover
        </Text>

        {vault.map((item) => {
          const cost = costInfo(item.failedAt);
          const dotColour = item.recovered ? colours.textDisabled : cost.colour;

          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleRecover(item.id)}
              disabled={item.recovered || cost.label === 'expired'}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colours.backgroundSurface,
                borderRadius: 8,
                padding: 12,
                marginBottom: 6,
                opacity: cost.label === 'expired' ? 0.4 : 1,
              }}
            >
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: dotColour, marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: item.recovered ? colours.textDisabled : colours.textPrimary }}>{item.title}</Text>
                <Text style={{ fontSize: 9, color: colours.textMuted, marginTop: 2 }}>
                  failed {timeAgo(item.failedAt)} · {item.wordCount} words
                </Text>
              </View>
              <View style={{
                backgroundColor: cost.colour + '20',
                borderRadius: 4,
                paddingHorizontal: 8,
                paddingVertical: 3,
              }}>
                <Text style={{ fontSize: 10, color: item.recovered ? colours.textDisabled : cost.colour }}>
                  {item.recovered ? 'done' : cost.badge}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <Text style={{ fontSize: 9, color: colours.textMuted, textAlign: 'center', marginTop: 16 }}>
          {graceTokens} grace tokens remaining
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
