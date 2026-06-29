import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { trigger, HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { useTheme } from '../theme/ThemeContext';
import { useHaptic } from '../theme/HapticContext';
import { DURATION, HAPTICS } from '../theme/animation';
import ProgressBar from './ProgressBar';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function TimerDisplay({ remainingMs, wordsWritten, targetWords, elapsedMs, state, totalDurationMs }) {
  const { colours } = useTheme();

  const totalSec = Math.max(0, Math.floor(remainingMs / 1000));
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  const secsStr = String(secs).padStart(2, '0');

  // WPM calculations
  const elapsedMin = (elapsedMs || 0) / 60000;
  const wpm = elapsedMin > 0.05 ? Math.round(wordsWritten / elapsedMin) : 0;
  const wpmFraction = Math.min(wpm / 60, 1);

  // Fraction for progress ring
  const finalTotalDuration = totalDurationMs || (mins > 0 ? (mins + 1) * 60000 : 25 * 60000);
  const fraction = Math.min(1, Math.max(0, (finalTotalDuration - remainingMs) / finalTotalDuration));

  // Anim values
  const arcAnim = useRef(new Animated.Value(0)).current;
  const rippleScale = useRef(new Animated.Value(0.8)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const digitsOpacity = useRef(new Animated.Value(1)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  // Digit roll anim
  const rollAnim = useRef(new Animated.Value(0)).current;
  const [displayedMins, setDisplayedMins] = useState(mins);
  const [nextMins, setNextMins] = useState(mins);

  const { enabled: hapticOn } = useHaptic();

  // Standard fraction progress update
  useEffect(() => {
    if (state !== 'completed') {
      Animated.timing(arcAnim, {
        toValue: fraction,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    }
  }, [fraction, state]);

  // Handle minute value change for Digit Roll
  useEffect(() => {
    if (mins !== nextMins) {
      setNextMins(mins);
      rollAnim.setValue(0);
      Animated.timing(rollAnim, {
        toValue: -32, // Shifting the height of one line
        duration: DURATION.digitRoll,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setDisplayedMins(mins);
        rollAnim.setValue(0);
      });
    }
  }, [mins]);

  // Session complete sequence
  useEffect(() => {
    if (state === 'completed') {
      // 1. Over-fill the arc briefly (animate to 1.05)
      Animated.timing(arcAnim, {
        toValue: 1.05,
        duration: DURATION.arcOverfill,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();

      // 2. Expand radial ripple
      rippleScale.setValue(0.8);
      rippleOpacity.setValue(0.4);
      Animated.parallel([
        Animated.timing(rippleScale, {
          toValue: 1.6,
          duration: DURATION.rippleExpand,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rippleOpacity, {
          toValue: 0,
          duration: DURATION.rippleExpand,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();

      // 3. Fade out digits & fade in completion text
      Animated.parallel([
        Animated.timing(digitsOpacity, {
          toValue: 0,
          duration: DURATION.completionFade,
          useNativeDriver: true,
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: DURATION.completionFade,
          useNativeDriver: true,
        }),
      ]).start();

      // 4. One single strong pulse haptic
      if (hapticOn) {
        try {
          trigger(HAPTICS.heavy, {
            enableVibrateFallback: true,
            ignoreAndroidSystemSettings: true,
          });
        } catch (_) {}
      }
    } else {
      // Reset if not completed
      digitsOpacity.setValue(1);
      successOpacity.setValue(0);
      rippleOpacity.setValue(0);
    }
  }, [state]);

  // Circular calculations
  const size = 180;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset = arcAnim.interpolate({
    inputRange: [0, 1, 1.05],
    outputRange: [circumference, 0, -circumference * 0.05],
  });

  return (
    <View style={styles.container}>
      <View style={[styles.arcWrapper, { width: size, height: size }]}>
        {/* Radial ripple effect for session complete */}
        <Animated.View
          style={[
            styles.ripple,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: colours.stateSuccess,
              transform: [{ scale: rippleScale }],
              opacity: rippleOpacity,
            },
          ]}
        />

        <Svg width={size} height={size}>
          {/* Background track circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colours.borderSubtle}
            strokeWidth={strokeWidth}
            fill="transparent"
            opacity={0.3}
          />
          {/* Active progress arc */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={state === 'completed' ? colours.stateSuccess : colours.accentGold}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>

        {/* Centered digits inside the ring */}
        <View style={styles.centerContainer}>
          {/* Timer digits overlay */}
          <Animated.View style={{ opacity: digitsOpacity, alignItems: 'center' }}>
            <View style={styles.timerRow}>
              {/* Minutes digits column for Digit Roll */}
              <View style={styles.digitsWrapper}>
                <Animated.View style={{ transform: [{ translateY: rollAnim }] }}>
                  <Text style={[styles.timerText, { color: colours.accentGold }]}>
                    {String(displayedMins).padStart(2, '0')}
                  </Text>
                  <Text style={[styles.timerText, { color: colours.accentGold }]}>
                    {String(nextMins).padStart(2, '0')}
                  </Text>
                </Animated.View>
              </View>

              <Text style={[styles.timerText, { color: colours.accentGold }]}>:</Text>

              {/* Seconds digits */}
              <Text style={[styles.timerText, { color: colours.accentGold }]}>
                {secsStr}
              </Text>
            </View>
          </Animated.View>

          {/* Completion message */}
          <Animated.View style={[StyleSheet.absoluteFill, styles.successWrapper, { opacity: successOpacity }]}>
            <Text style={[styles.successText, { color: colours.stateSuccess }]}>
              Session{"\n"}Complete ✓
            </Text>
          </Animated.View>
        </View>
      </View>

      {/* Progress Bars below the circle */}
      <View style={{ width: '100%', marginTop: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ fontSize: 10, color: colours.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>wpm</Text>
          <Text style={{ fontSize: 10, color: colours.accentGold, fontFamily: 'monospace', fontWeight: '500' }}>{wpm}</Text>
        </View>
        <ProgressBar fraction={wpmFraction} height={3} />
      </View>

      <View style={{ width: '100%', marginTop: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ fontSize: 10, color: colours.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>words</Text>
          <Text style={{ fontSize: 10, color: colours.accentGold, fontFamily: 'monospace', fontWeight: '500' }}>
            {wordsWritten} / {targetWords}
          </Text>
        </View>
        <ProgressBar fraction={targetWords > 0 ? Math.min(wordsWritten / targetWords, 1) : 0} height={3} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
    width: '100%',
  },
  arcWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    borderWidth: 4,
  },
  centerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    height: 140,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
  },
  digitsWrapper: {
    height: 32,
    overflow: 'hidden',
    width: 44,
  },
  timerText: {
    fontSize: 28,
    fontFamily: 'monospace',
    letterSpacing: 1,
    height: 32,
    lineHeight: 32,
    textAlign: 'center',
    fontWeight: '600',
  },
  successWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 20,
    textTransform: 'uppercase',
  },
});
