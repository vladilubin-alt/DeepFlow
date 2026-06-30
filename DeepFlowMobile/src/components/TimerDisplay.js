import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { trigger, HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { useTheme } from '../theme/ThemeContext';
import { useHaptic } from '../theme/HapticContext';
import { DURATION, HAPTICS } from '../theme/animation';
import ProgressBar from './ProgressBar';

export default function TimerDisplay({ remainingMs, wordsWritten, targetWords, elapsedMs, state, totalDurationMs }) {
  const { colours } = useTheme();

  const totalSec = Math.max(0, Math.floor(remainingMs / 1000));
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  const secsStr = String(secs).padStart(2, '0');
  const minsStr = String(mins).padStart(2, '0');

  const elapsedMin = (elapsedMs || 0) / 60000;
  const wpm = elapsedMin > 0.05 ? Math.round(wordsWritten / elapsedMin) : 0;
  const wpmFraction = Math.min(wpm / 60, 1);

  const finalTotalDuration = totalDurationMs || (mins > 0 ? (mins + 1) * 60000 : 25 * 60000);
  const fraction = Math.min(1, Math.max(0, (finalTotalDuration - remainingMs) / finalTotalDuration));

  const digitsOpacity = useRef(new Animated.Value(1)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const { enabled: hapticOn } = useHaptic();

  useEffect(() => {
    if (state === 'completed') {
      Animated.parallel([
        Animated.timing(digitsOpacity, {
          toValue: 0, duration: DURATION.completionFade, useNativeDriver: true,
        }),
        Animated.timing(successOpacity, {
          toValue: 1, duration: DURATION.completionFade, useNativeDriver: true,
        }),
      ]).start();

      if (hapticOn) {
        try { trigger(HAPTICS.heavy, { enableVibrateFallback: true, ignoreAndroidSystemSettings: true }); } catch (_) {}
      }
    } else {
      digitsOpacity.setValue(1);
      successOpacity.setValue(0);
    }
  }, [state]);

  return (
    <View style={styles.container}>
      <View style={styles.timerRow}>
        <Animated.View style={{ opacity: digitsOpacity, flexDirection: 'row', alignItems: 'baseline' }}>
          <Text style={[styles.timerText, { color: colours.accentGold }]}>{minsStr}</Text>
          <Text style={[styles.timerSeparator, { color: colours.accentGold }]}>:</Text>
          <Text style={[styles.timerText, { color: colours.accentGold }]}>{secsStr}</Text>
        </Animated.View>

        <Animated.View style={[StyleSheet.absoluteFill, { opacity: successOpacity, alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={[styles.successText, { color: colours.stateSuccess }]}>Session Complete ✓</Text>
        </Animated.View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, {
          width: `${fraction * 100}%`,
          backgroundColor: state === 'completed' ? colours.stateSuccess : colours.accentGold,
        }]} />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBlock}>
          <Text style={[styles.statLabel, { color: colours.textMuted }]}>wpm</Text>
          <Text style={[styles.statValue, { color: colours.accentGold }]}>{wpm}</Text>
        </View>
        <View style={styles.statBlock}>
          <Text style={[styles.statLabel, { color: colours.textMuted }]}>words</Text>
          <Text style={[styles.statValue, { color: colours.accentGold }]}>{wordsWritten}/{targetWords}</Text>
        </View>
      </View>

      <View style={{ marginTop: 4 }}>
        <ProgressBar fraction={wpmFraction} height={2} />
      </View>
      <View style={{ marginTop: 6 }}>
        <ProgressBar fraction={targetWords > 0 ? Math.min(wordsWritten / targetWords, 1) : 0} height={2} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    height: 48,
    position: 'relative',
  },
  timerText: {
    fontSize: 42,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 2,
    lineHeight: 48,
  },
  timerSeparator: {
    fontSize: 36,
    fontFamily: 'monospace',
    fontWeight: '300',
    lineHeight: 48,
    marginHorizontal: 2,
  },
  progressTrack: {
    width: '60%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
    paddingHorizontal: 4,
  },
  statBlock: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  successText: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
