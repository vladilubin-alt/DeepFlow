import React, { useCallback, useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Animated, Dimensions } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { track } from '../services/AnalyticsService';
import { supabase } from '../lib/supabase';
import Superwall from '@superwall/react-native-superwall';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CONFETTI_COLORS = ['#EF9F27', '#4ade80', '#C9A84C', '#E24B4A', '#8B5CF6', '#06B6D4'];

function ConfettiParticle({ color, delay, startX }) {
  const translateY = useRef(new Animated.Value(-20)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay * 1000),
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT + 50,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: (Math.random() - 0.5) * 100,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 720,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: startX,
        top: -10,
        width: 8,
        height: 8,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? 4 : 2,
        transform: [
          { translateY },
          { translateX },
          { rotate: rotate.interpolate({ inputRange: [0, 360, 720], outputRange: ['0deg', '360deg', '720deg'] }) },
        ],
        opacity,
      }}
    />
  );
}

function Confetti() {
  const particles = useRef(
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: Math.random() * 0.5,
      startX: Math.random() * SCREEN_WIDTH,
    }))
  ).current;

  return (
    <View style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 60 }}>
      {particles.map((p) => (
        <ConfettiParticle key={p.id} color={p.color} delay={p.delay} startX={p.startX} />
      ))}
    </View>
  );
}

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

function getScoreColor(score, colours) {
  if (score >= 80) return colours.stateSuccess;
  if (score >= 50) return colours.accentGold;
  return colours.stateDanger;
}

function getScoreLabel(score) {
  if (score >= 90) return 'Outstanding';
  if (score >= 75) return 'Great focus';
  if (score >= 50) return 'Good effort';
  if (score >= 30) return 'Room to improve';
  return 'Tough session';
}

export default function FocusReportModal({
  visible,
  onDismiss,
  wordsWritten,
  targetWords,
  durationSeconds,
  guillotined,
  graceTokens = 0,
  onUseGraceToken,
  onGiveUp,
}) {
  const { colours } = useTheme();
  const [stats, setStats] = useState({ bestWpm: 0, totalWords: 0, totalSessions: 0, streak: 0 });

  const wpm = durationSeconds > 0
    ? Math.round(wordsWritten / (durationSeconds / 60))
    : 0;
  const targetPct = targetWords > 0
    ? Math.round((wordsWritten / targetWords) * 100)
    : 0;
  const focusScore = calcFocusScore(wordsWritten, targetWords, durationSeconds, guillotined);

  useEffect(() => {
    if (!visible) return;
    const fetchStats = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        const { data } = await supabase
          .from('writing_sessions')
          .select('words_written, duration_seconds, started_at, status')
          .eq('user_id', session.user.id)
          .order('started_at', { ascending: false })
          .limit(50);
        if (!data || data.length === 0) return;

        let bestWpm = 0;
        let totalWords = 0;
        data.forEach(s => {
          const d = s.duration_seconds / 60;
          const sessionWpm = d > 0 ? Math.round(s.words_written / d) : 0;
          if (sessionWpm > bestWpm) bestWpm = sessionWpm;
          totalWords += s.words_written || 0;
        });

        const activeDates = new Set(
          data.filter(s => s.status === 'completed' || s.status === 'saved_by_grace')
            .map(s => s.started_at?.split('T')[0])
        );
        let streak = 0;
        const d = new Date();
        while (activeDates.has(d.toISOString().split('T')[0])) {
          streak++;
          d.setDate(d.getDate() - 1);
        }

        setStats({ bestWpm, totalWords, totalSessions: data.length, streak });
      } catch (e) {}
    };
    fetchStats();
  }, [visible]);

  const metric = (label, value, subtext) => (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontSize: 22, color: colours.accentGold, fontWeight: '600', marginBottom: 2 }}>
        {value}
      </Text>
      <Text style={{ fontSize: 9, color: colours.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </Text>
      {subtext && (
        <Text style={{ fontSize: 8, color: colours.textDisabled, marginTop: 1 }}>
          {subtext}
        </Text>
      )}
    </View>
  );

  const [showBreakdown, setShowBreakdown] = useState(false);

  const showUpsell = useCallback(async () => {
    if (showBreakdown) {
      setShowBreakdown(false);
      return;
    }
    try {
      await Superwall.register({
        placement: 'focus_report',
        feature: () => {
          track('Focus Report Upsell Converted');
        },
      });
    } catch (e) {
      console.warn('[FocusReport] Upsell trigger failed:', e.message);
    }
    track('Focus Report Upsell Shown');
  }, [showBreakdown]);

  const scoreColor = getScoreColor(focusScore, colours);
  const scoreLabel = getScoreLabel(focusScore);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      {focusScore >= 80 && <Confetti />}
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
          maxWidth: 360,
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
            marginBottom: guillotined ? 4 : 20,
          }}>
            {guillotined ? 'Your session was guillotined' : 'Great flow — here\'s how you did'}
          </Text>
          {guillotined && (
            <Text style={{
              fontSize: 10,
              color: colours.stateDangerMuted,
              textAlign: 'center',
              marginBottom: 16,
              fontFamily: 'monospace',
            }}>
              Life happened. 1 Grace Token consumed to save your streak.
            </Text>
          )}

          <View style={{
            backgroundColor: colours.backgroundBase,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
          }}>
            <View style={{ alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ fontSize: 42, color: scoreColor, fontWeight: '700' }}>
                {focusScore}
              </Text>
              <Text style={{ fontSize: 10, color: scoreColor, fontWeight: '500', marginBottom: 2 }}>
                {scoreLabel}
              </Text>
              <Text style={{ fontSize: 9, color: colours.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>
                Focus Score
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 }}>
              {metric('Words', wordsWritten, `of ${targetWords}`)}
              {metric('WPM', wpm, stats.bestWpm > 0 ? `best: ${stats.bestWpm}` : '')}
              {metric('Target', `${targetPct}%`, '')}
            </View>

            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: colours.borderSubtle, alignItems: 'center' }}>
              <Text style={{ fontSize: 11, color: colours.textMuted }}>
                Duration: {formatDuration(durationSeconds)}
              </Text>
            </View>
          </View>

          <View style={{
            flexDirection: 'row',
            backgroundColor: colours.backgroundBase,
            borderRadius: 10,
            padding: 12,
            marginBottom: 12,
            gap: 8,
          }}>
            {[
              { label: 'Streak', value: `${stats.streak}d`, icon: '🔥' },
              { label: 'Sessions', value: stats.totalSessions, icon: '📝' },
              { label: 'Total Words', value: stats.totalWords.toLocaleString(), icon: '✍️' },
            ].map((item, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 14 }}>{item.icon}</Text>
                <Text style={{ fontSize: 14, color: colours.accentGold, fontWeight: '600', marginTop: 2 }}>
                  {item.value}
                </Text>
                <Text style={{ fontSize: 8, color: colours.textMuted, marginTop: 1 }}>
                  {item.label}
                </Text>
              </View>
            ))}
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
              {showBreakdown ? 'Hide Breakdown' : 'See Full Breakdown → Unlock Premium Insights'}
            </Text>
          </TouchableOpacity>

          {showBreakdown && (
            <View style={{ backgroundColor: colours.backgroundSurface, borderRadius: 10, padding: 14, marginBottom: 12 }}>
              <Text style={{ fontSize: 12, color: colours.textPrimary, fontWeight: '600', marginBottom: 10 }}>Session Analytics</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 11, color: colours.textMuted }}>Best WPM</Text>
                <Text style={{ fontSize: 11, color: colours.textPrimary, fontWeight: '500' }}>{stats.bestWpm}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 11, color: colours.textMuted }}>Total Words</Text>
                <Text style={{ fontSize: 11, color: colours.textPrimary, fontWeight: '500' }}>{stats.totalWords.toLocaleString()}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 11, color: colours.textMuted }}>Total Sessions</Text>
                <Text style={{ fontSize: 11, color: colours.textPrimary, fontWeight: '500' }}>{stats.totalSessions}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 11, color: colours.textMuted }}>Current Streak</Text>
                <Text style={{ fontSize: 11, color: colours.textPrimary, fontWeight: '500' }}>{stats.streak} days</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 11, color: colours.textMuted }}>Avg WPM</Text>
                <Text style={{ fontSize: 11, color: colours.textPrimary, fontWeight: '500' }}>
                  {stats.totalSessions > 0 ? Math.round(stats.totalWords / (stats.totalSessions * 5)) : 0}
                </Text>
              </View>
            </View>
          )}

          {guillotined && onUseGraceToken && (
            <TouchableOpacity
              onPress={onUseGraceToken}
              style={{
                backgroundColor: colours.accentGold,
                borderRadius: 10,
                paddingVertical: 14,
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 13, color: colours.accentGoldText, fontWeight: '600' }}>
                Use Grace Token ({graceTokens} left)
              </Text>
            </TouchableOpacity>
          )}

          {guillotined && onGiveUp && (
            <TouchableOpacity
              onPress={onGiveUp}
              style={{
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: 'center',
                backgroundColor: 'transparent',
                borderWidth: 0.5,
                borderColor: colours.textMuted + '40',
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 11, color: colours.textMuted }}>give up & clear</Text>
            </TouchableOpacity>
          )}

          {!guillotined && (
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
          )}
        </View>
      </View>
    </Modal>
  );
}
