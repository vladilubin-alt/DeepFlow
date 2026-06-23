import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

const MOCK_HISTORY = [
  { date: 'Jun 22', duration: '25 min', words: 420, success: true },
  { date: 'Jun 21', duration: '10 min', words: 90, success: false, failedAt: '01:15' },
  { date: 'Jun 20', duration: '25 min', words: 510, success: true },
  { date: 'Jun 19', duration: '45 min', words: 780, success: true },
  { date: 'Jun 18', duration: '25 min', words: 340, success: true },
  { date: 'Jun 17', duration: '10 min', words: 55, success: false, failedAt: '02:30' },
  { date: 'Jun 16', duration: '25 min', words: 620, success: true },
];

export default function HistoryScreen() {
  const { colours } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colours.backgroundBase }}>
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={{ fontSize: 13, color: colours.textPrimary, fontWeight: '500', marginTop: 8, marginBottom: 16 }}>
          History
        </Text>

        {MOCK_HISTORY.map((row, i) => (
          <View key={i} style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: colours.backgroundSurface,
            borderRadius: 8,
            padding: 12,
            marginBottom: 4,
          }}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'baseline' }}>
              <Text style={{ fontSize: 11, color: colours.textMuted }}>{row.date}</Text>
              <Text style={{ fontSize: 11, color: colours.textMuted }}>{row.duration}</Text>
            </View>
            <Text style={{
              fontSize: 11,
              color: row.success ? colours.stateSuccess : colours.stateDanger,
              fontFamily: 'monospace',
            }}>
              {row.success ? `${row.words} words` : `failed at ${row.failedAt}`}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
