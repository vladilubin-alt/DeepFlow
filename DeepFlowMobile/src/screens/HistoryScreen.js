import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useSessionHistory } from '../hooks/useSessionHistory';
import WordCountChart from '../components/WordCountChart';

function formatDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function StreakCalendar({ sessions, colours }) {
  const today = new Date();
  const days = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d);
  }

  const activeDates = new Set(
    (sessions || [])
      .filter(s => s.status === 'completed' || s.status === 'saved_by_grace')
      .map(s => s.started_at?.split('T')[0])
      .filter(Boolean),
  );

  const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <View>
      <View style={{ flexDirection: 'row', marginBottom: 4 }}>
        {weekdays.map((day, i) => (
          <View key={i} style={{ width: '12.5%', alignItems: 'center' }}>
            <Text style={{ fontSize: 8, color: colours.textMuted, fontWeight: '500' }}>
              {day}
            </Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
        {days.map((d, i) => {
          const key = d.toISOString().split('T')[0];
          const hasSession = activeDates.has(key);
          const isToday = key === today.toISOString().split('T')[0];
          const isFirstOfMonth = d.getDate() === 1;
          const isSunday = d.getDay() === 0;
          const showBorder = isFirstOfMonth || isSunday;
          return (
            <View
              key={i}
              style={{
                width: '12.5%',
                aspectRatio: 1,
                borderRadius: 6,
                backgroundColor: hasSession
                  ? colours.accentGold
                  : isToday
                    ? colours.backgroundRaised
                    : colours.backgroundSurface,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: showBorder ? 0.5 : 0,
                borderColor: colours.borderSubtle,
              }}
            >
              <Text style={{
                fontSize: 9,
                fontFamily: 'monospace',
                color: hasSession ? colours.backgroundBase : colours.textMuted,
                fontWeight: hasSession ? '600' : '400',
              }}>
                {d.getDate()}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function statusBadgeStyle(status, colours) {
  switch (status) {
    case 'completed':
      return { bg: colours.stateSuccessBg, text: colours.stateSuccessText, label: 'completed' };
    case 'guillotined':
      return { bg: colours.stateDangerBg, text: colours.stateDangerText, label: 'guillotined' };
    case 'saved_by_grace':
      return { bg: colours.accentAmberBg, text: colours.accentAmberText, label: 'grace' };
    default:
      return { bg: colours.backgroundSurface, text: colours.textMuted, label: status };
  }
}

function calcFocusScore(session) {
  const durationMin = session.duration_seconds / 60;
  const wpm = durationMin > 0 ? session.words_written / durationMin : 0;
  const targetRatio = session.target_words > 0
    ? Math.min(1, session.words_written / session.target_words) : 0;
  const penalty = session.guillotine_triggered ? 0.3 : 0;
  return Math.round(Math.max(0, Math.min(100,
    (wpm / 40) * 50 + targetRatio * 50 - penalty * 100)));
}

function FocusScoreCard({ session, colours }) {
  const durationMin = session.duration_seconds / 60;
  const wpm = durationMin > 0 ? Math.round(session.words_written / durationMin) : 0;
  const targetPct = session.target_words > 0
    ? Math.round((session.words_written / session.target_words) * 100)
    : 0;

  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 8,
      marginTop: 8,
      borderTopWidth: 0.5,
      borderTopColor: colours.borderSubtle,
    }}>
      {[
        { label: 'Focus', value: calcFocusScore(session) },
        { label: 'WPM', value: wpm },
        { label: 'Target', value: `${targetPct}%` },
      ].map((item, i) => (
        <View key={i} style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 18, color: colours.accentGold, fontFamily: 'monospace', fontWeight: '500' }}>
            {item.value}
          </Text>
          <Text style={{ fontSize: 9, color: colours.textMuted, marginTop: 2 }}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

export default function HistoryScreen() {
  const { colours } = useTheme();
  const {
    sessions, loading, error, streak,
    totalWords, totalSessions,
    selected, setSelected, refresh,
  } = useSessionHistory();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colours.backgroundBase }}>
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 12 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colours.accentGold} />}
      >
        <Text style={{
          fontSize: 20,
          color: colours.accentGold,
          fontStyle: 'italic',
          fontWeight: '400',
          letterSpacing: 0.5,
          marginTop: 4,
          marginBottom: 2,
        }}>
          Flow History
        </Text>
        <Text style={{
          fontSize: 9,
          color: colours.textMuted,
          textTransform: 'uppercase',
          letterSpacing: 1.5,
          marginBottom: 16,
        }}>
          Focus Timer Analytics
        </Text>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          <View style={{
            flex: 1,
            backgroundColor: colours.backgroundSurface,
            borderRadius: 16,
            padding: 14,
          }}>
            <Text style={{ fontSize: 9, color: colours.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              Streak
            </Text>
            <Text style={{ fontSize: 24, color: colours.accentGold, fontWeight: '500' }}>
              {streak}<Text style={{ fontSize: 12, color: colours.textMuted }}> days</Text>
            </Text>
            <View style={{ marginTop: 12 }}>
              <StreakCalendar sessions={sessions} colours={colours} />
            </View>
          </View>

          <View style={{
            flex: 1,
            backgroundColor: colours.backgroundSurface,
            borderRadius: 16,
            padding: 14,
            justifyContent: 'center',
          }}>
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 9, color: colours.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                Sessions
              </Text>
              <Text style={{ fontSize: 24, color: colours.accentGold, fontWeight: '500' }}>
                {totalSessions}
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 9, color: colours.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                Total Words
              </Text>
              <Text style={{ fontSize: 24, color: colours.accentGold, fontWeight: '500' }}>
                {totalWords}
              </Text>
            </View>
          </View>
        </View>

        <WordCountChart sessions={sessions} />

        {error && (
          <View style={{
            backgroundColor: colours.stateDangerBg,
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
          }}>
            <Text style={{ fontSize: 11, color: colours.stateDangerText, fontFamily: 'monospace' }}>
              {error}
            </Text>
          </View>
        )}

        {!loading && sessions.length === 0 && !error && (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 11, color: colours.textMuted, textAlign: 'center' }}>
              No sessions recorded yet.{'\n'}Start a timer from the Home tab.
            </Text>
          </View>
        )}

        {sessions.map((s) => {
          const badge = statusBadgeStyle(s.status, colours);
          const isSelected = selected?.id === s.id;
          return (
            <TouchableOpacity
              key={s.id}
              onPress={() => setSelected(isSelected ? null : s)}
              activeOpacity={0.7}
              accessibilityLabel={`Session: ${s.words_written} words, ${badge.label}. Double tap for details`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              style={{
                backgroundColor: isSelected ? colours.backgroundRaised : colours.backgroundSurface,
                borderRadius: 12,
                padding: 12,
                marginBottom: 4,
                borderWidth: 0.5,
                borderColor: isSelected ? colours.accentGold + '40' : 'transparent',
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{
                    backgroundColor: badge.bg,
                    borderRadius: 4,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                  }}>
                    <Text style={{ fontSize: 9, color: badge.text, fontFamily: 'monospace' }}>
                      {badge.label}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 11, color: colours.textPrimary, fontFamily: 'monospace' }}>
                    {s.words_written} words
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <Text style={{ fontSize: 9, color: colours.textMuted, fontFamily: 'monospace' }}>
                    {formatDuration(s.duration_seconds)}
                  </Text>
                  <Text style={{ fontSize: 9, color: colours.textMuted }}>
                    {formatDate(s.started_at)}
                  </Text>
                </View>
              </View>
              {isSelected && <FocusScoreCard session={s} colours={colours} />}
            </TouchableOpacity>
          );
        })}

        {sessions.length > 0 && (
          <TouchableOpacity
            onPress={onRefresh}
            activeOpacity={0.7}
            style={{
              marginTop: 12,
              paddingVertical: 10,
              alignItems: 'center',
              backgroundColor: colours.backgroundSurface,
              borderRadius: 20,
              borderWidth: 0.5,
              borderColor: colours.borderMedium,
            }}
          >
            <Text style={{ fontSize: 10, color: colours.textMuted, fontFamily: 'monospace' }}>
              {loading ? 'Loading...' : 'Refresh'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
