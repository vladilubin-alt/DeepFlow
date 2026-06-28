import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { DURATION } from '../theme/animation';

export default function Splash({ colours, ready, onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const progressOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [animDone, setAnimDone] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: DURATION.splashFadeIn,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: DURATION.splashPulse / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: DURATION.splashPulse / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
      setAnimDone(true);
    });

    const progressTimer = setTimeout(() => {
      Animated.timing(progressOpacity, {
        toValue: 1,
        duration: DURATION.progressBarFadeIn,
        useNativeDriver: true,
      }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 2000);

    return () => clearTimeout(progressTimer);
  }, []);

  useEffect(() => {
    if (ready) {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: DURATION.splashFadeOut,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }
  }, [ready]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colours.backgroundBase,
          opacity: containerOpacity,
        },
      ]}
    >
      <View style={styles.center}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View
            style={[
              styles.logoIcon,
              {
                backgroundColor: colours.accentGold,
                shadowColor: colours.accentGold,
              },
            ]}
          >
            <Svg width={72} height={72} viewBox="0 0 72 72">
              <Path d="M36 8 L64 36 L36 64 L8 36 Z" fill={colours.accentGold} stroke={colours.accentGold} strokeWidth={2} />
              <Path d="M36 20 L52 36 L36 52 L20 36 Z" fill={colours.backgroundBase} opacity={0.9} />
            </Svg>
          </View>
          <Text style={[styles.logoText, { color: colours.accentGold }]}>
            DeepFlow
          </Text>
          <Text style={[styles.subtitle, { color: colours.textMuted }]}>
            ADHD WRITING INSTRUMENT
          </Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.progressContainer, { opacity: progressOpacity }]}>
        <View style={[styles.progressBarBg, { backgroundColor: colours.borderSubtle }]}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: colours.accentGold,
                opacity: pulseAnim,
              },
            ]}
          />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 2.5,
    fontWeight: '500',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 48,
    left: '20%',
    right: '20%',
    alignItems: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: 2,
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
});
