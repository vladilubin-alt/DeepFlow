import { View, Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';
import { useTheme } from '../theme/ThemeContext';

export default function OrbVisualiser({ state, velocity = 0 }) {
  const { colours } = useTheme();
  const morphCycle = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;
  const burstAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const prevVelRef = useRef(velocity);
  const morphLoopRef = useRef(null);
  const glowLoopRef = useRef(null);
  const floatLoopRef = useRef(null);

  const isWarning = state === 'warning' || state === 'guillotined';
  const isWriting = state === 'writing' || state === 'saved_by_grace';
  const isCompleted = state === 'completed';
  const isDanger = state === 'guillotined';

  const isActive = isWarning;

  const cycleDuration = isWarning ? 3000 : 10000;

  const coreColor = isDanger
    ? colours.stateDanger
    : isWarning
      ? colours.stateDanger
      : isWriting
        ? colours.accentGold
        : colours.textMuted;

  const glowColor = isDanger
    ? colours.stateDanger + '22'
    : isWarning
      ? colours.stateDanger + '1A'
      : isWriting
        ? colours.accentGold + '20'
        : colours.textMuted + '0D';

  // Smooth continuous morph cycle via animated interpolation
  useEffect(() => {
    if (morphLoopRef.current) morphLoopRef.current.stop();
    if (isActive) {
      morphCycle.setValue(0);
      morphLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(morphCycle, {
            toValue: 1,
            duration: cycleDuration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
          Animated.timing(morphCycle, {
            toValue: 0,
            duration: cycleDuration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
        ]),
      );
      morphLoopRef.current.start();
    } else {
      morphCycle.setValue(0.5);
    }
    return () => { if (morphLoopRef.current) morphLoopRef.current.stop(); };
  }, [isActive, cycleDuration]);

  // Corner radius interpolations for smooth blob morph
  const tl = morphCycle.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [28, 20, 24, 32, 28],
  });
  const tr = morphCycle.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [20, 28, 16, 24, 20],
  });
  const br = morphCycle.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [16, 22, 32, 18, 16],
  });
  const bl = morphCycle.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [32, 18, 16, 22, 32],
  });

  // Gentle pulsing glow — still for writing (blob morphs but doesn't pulse), pulses during warning
  useEffect(() => {
    if (glowLoopRef.current) glowLoopRef.current.stop();
    if (isWriting) {
      glowOpacity.setValue(0.35);
    } else if (isWarning) {
      glowLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 0.8, duration: cycleDuration / 2,
            easing: Easing.inOut(Easing.sin), useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.4, duration: cycleDuration / 2,
            easing: Easing.inOut(Easing.sin), useNativeDriver: true,
          }),
        ]),
      );
      glowLoopRef.current.start();
    } else if (isCompleted) {
      Animated.timing(glowOpacity, {
        toValue: 0, duration: 800, useNativeDriver: true,
      }).start();
    } else {
      glowOpacity.setValue(0.2);
    }
    return () => { if (glowLoopRef.current) glowLoopRef.current.stop(); };
  }, [isWriting, isWarning, isCompleted, cycleDuration]);

  // Gentle floating for writing state — slow translateY bob
  useEffect(() => {
    if (floatLoopRef.current) floatLoopRef.current.stop();
    if (isWriting) {
      floatAnim.setValue(0);
      floatLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: 1, duration: 3000,
            easing: Easing.inOut(Easing.sin), useNativeDriver: false,
          }),
          Animated.timing(floatAnim, {
            toValue: 0, duration: 3000,
            easing: Easing.inOut(Easing.sin), useNativeDriver: false,
          }),
        ]),
      );
      floatLoopRef.current.start();
    } else {
      floatAnim.setValue(0);
    }
    return () => { if (floatLoopRef.current) floatLoopRef.current.stop(); };
  }, [isWriting]);

  // Burst effect on velocity change
  useEffect(() => {
    if (velocity > 0 && velocity !== prevVelRef.current) {
      prevVelRef.current = velocity;
      burstAnim.setValue(1.15);
      Animated.timing(burstAnim, {
        toValue: 1, duration: 350, easing: Easing.out(Easing.ease), useNativeDriver: false,
      }).start();
    }
  }, [velocity]);

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-4, 4],
  });

  const size = 32;

  return (
    <Animated.View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 6, height: 50, transform: [{ translateY: floatY }] }}>
      <Animated.View style={{
        position: 'absolute',
        width: 64, height: 64,
        borderRadius: 32,
        backgroundColor: glowColor,
        opacity: glowOpacity,
      }} />

      <Animated.View style={{
        width: size, height: size,
        borderTopLeftRadius: tl,
        borderTopRightRadius: tr,
        borderBottomRightRadius: br,
        borderBottomLeftRadius: bl,
        backgroundColor: coreColor,
        transform: [{ scale: burstAnim }],
        shadowColor: coreColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 4,
      }} />
    </Animated.View>
  );
}
