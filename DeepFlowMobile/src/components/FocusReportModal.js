import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { track } from '../services/AnalyticsService';

function calcFocusScore(wordsWritten, targetWords, durationSeconds, guillotined) {
  const durationMin = durationSeconds / 60;
  const wpm = durationMin > 0 ? wordsWritten / durationMin : 0;
  const targetRatio = targetWords > 0
    ? Math.min(1, wordsWritten / targetWords)
    : 0;
  const penalty = guillotined ? 0.3 : 0;
  return Math.round(Math.max(0, Math.min(100,
    (wpm / 40) * 50 + targetRatio * 50 - penalty * 100
  )));
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${s}s`;
}

export default function FocusReportModal({
  visible,
  onDismiss,
  wordsWritten,
  targetWords,
  durationSeconds,
  guillotined,
}) {
  const { colours } = useTheme();
  const wpm = durationSeconds > 0
    ? Math.round(wordsWritten / (durationSeconds / 60))
    : 0;
  const targetPct = targetWords > 0
    ? Math.round((wordsWritten / targetWords) * 100)
    : 0;
  const focusScore = calcFocusScore(wordsWritten, targetWords, durationSeconds, guillotined);

  const metric = (label, value) => (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontSize: 22, color: colours.accentGold, fontWeight: '600', marginBottom: 2 }}>
        {value}
      </Text>
      <Text style={{ fontSize: 9, color: colours.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </Text>
    </View>
  );

  const showUpsell = useCallback(async () => {
    try {
      const Superwall = require('@superwall/react-native-superwall').default;
      await Superwall.shared.register({
        placement: 'focus_report',
        feature: () => {
          track('Focus Report Upsell Converted');
        },
      });
    } catch (e) {
      console.warn('[FocusReport] Upsell trigger failed:', e.message);
    }
    track('Focus Report Upsell Shown');
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 24,
      }}>
        <View style={{
          backgroundColor: colours.backgroundSurface,
          borderRadius: 20,
          padding: 24,
          width: '100%',
          maxWidth: 340,
        }}>
          <Text style={{
            fontSize: 15,
            color: colours.textPrimary,
            fontWeight: '500',
            textAlign: 'center',
            marginBottom: 4,
          }}>
            {guillotined ? 'Focus Report' : 'Session Complete'}
          </Text>
          <Text style={{
            fontSize: 9,
            color: colours.textMuted,
            textTransform: 'uppercase',
            letterSpacing: 1,
            textAlign: 'center',
            marginBottom: 20,
          }}>
            {guillotined ? 'Your session was guillotined' : 'Great flow — here\'s how you did'}
          </Text>

          <View style={{
            backgroundColor: colours.backgroundBase,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
          }}>
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 36, color: colours.accentGold, fontWeight: '700' }}>
                {focusScore}
              </Text>
              <Text style={{ fontSize: 9, color: colours.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>
                Focus Score
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              {metric('Words', wordsWritten)}
              {metric('WPM', wpm)}
              {metric('Target', `${targetPct}%`)}
            </View>

            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: colours.borderSubtle, alignItems: 'center' }}>
              <Text style={{ fontSize: 11, color: colours.textMuted }}>
                Duration: {formatDuration(durationSeconds)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={showUpsell}
            style={{
              backgroundColor: colours.accentGold + '20',
              borderRadius: 10,
              paddingVertical: 12,
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 11, color: colours.accentGold, fontWeight: '500', letterSpacing: 0.5 }}>
              See Full Breakdown → Unlock Premium Insights
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onDismiss}
            style={{
              borderRadius: 10,
              paddingVertical: 12,
              alignItems: 'center',
              backgroundColor: colours.backgroundBase,
            }}
          >
            <Text style={{ fontSize: 11, color: colours.textMuted, fontWeight: '400' }}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
