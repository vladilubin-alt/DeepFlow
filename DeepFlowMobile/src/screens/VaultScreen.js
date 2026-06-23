import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

const MOCK_VAULT = [
  { id: '1', title: 'Untitled draft', failedAt: new Date(Date.now() - 30 * 60 * 1000), wordCount: 145, recovered: false },
  { id: '2', title: 'Morning pages', failedAt: new Date(Date.now() - 6 * 3600 * 1000), wordCount: 320, recovered: false },
  { id: '3', title: 'Project notes', failedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000), wordCount: 89, recovered: false },
  { id: '4', title: 'Old draft', failedAt: new Date(Date.now() - 40 * 24 * 3600 * 1000), wordCount: 500, recovered: false },
];

function costInfo(failedAt) {
  const hoursAgo = (Date.now() - failedAt.getTime()) / 3600000;
  if (hoursAgo < 1) return { badge: '50 tokens', colour: colours.stateSuccess, label: 'Free' };
  if (hoursAgo < 168) return { badge: '$0.99', colour: colours.accentGold, label: 'Micro' };
  if (hoursAgo < 720) return { badge: '$1.99', colour: colours.stateDangerMuted, label: 'Paid' };
  return { badge: 'gone', colour: '#2a2510', label: 'Expired' };
}

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

  const handleRecover = (id) => {
    setVault((prev) => prev.map((item) => item.id === id ? { ...item, recovered: true } : item));
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
              disabled={item.recovered || cost.label === 'Expired'}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colours.backgroundSurface,
                borderRadius: 8,
                padding: 12,
                marginBottom: 6,
                opacity: cost.label === 'Expired' ? 0.4 : 1,
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

      </ScrollView>
    </SafeAreaView>
  );
}
