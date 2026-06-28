import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function WordCountChart({ sessions }) {
  const { colours } = useTheme();

  if (!sessions || sessions.length === 0) {
    return (
      <View style={{ paddingVertical: 20, alignItems: 'center' }}>
        <Text style={{ fontSize: 11, color: colours.textMuted }}>No session data yet.</Text>
      </View>
    );
  }

  const sorted = [...sessions].reverse();
  const maxWords = Math.max(...sorted.map(s => s.words_written || 0), 1);
  const barWidth = Math.max(8, Math.min(24, Math.floor(300 / sorted.length) - 2));
  const chartHeight = 100;

  return (
    <View style={{ backgroundColor: colours.backgroundSurface, borderRadius: 12, padding: 14, marginTop: 12 }}>
      <Text style={{ fontSize: 9, color: colours.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
        Word Count Trend
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: chartHeight, gap: 3, paddingBottom: 16 }}>
        {sorted.map((s, i) => {
          const h = Math.max(3, (s.words_written / maxWords) * (chartHeight - 20));
          const isCompleted = s.status === 'completed';
          const isGuillotined = s.status === 'guillotined';
          const barColour = isCompleted ? colours.accentGold : isGuillotined ? colours.stateDanger : colours.accentAmberDark;
          return (
            <View key={s.id || i} style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 7, color: colours.textMuted, marginBottom: 2 }}>
                {s.words_written}
              </Text>
              <View style={{
                width: barWidth,
                height: h,
                borderRadius: 4,
                backgroundColor: barColour,
                opacity: isCompleted ? 0.9 : 0.6,
              }} />
              {sorted.length <= 12 && (
                <Text style={{ fontSize: 7, color: colours.textMuted, marginTop: 3 }}>
                  {new Date(s.started_at).getDate()}
                </Text>
              )}
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: colours.accentGold }} />
          <Text style={{ fontSize: 8, color: colours.textMuted }}>completed</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: colours.stateDanger }} />
          <Text style={{ fontSize: 8, color: colours.textMuted }}>guillotined</Text>
        </View>
      </View>
    </View>
  );
}
