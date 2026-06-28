import { View, Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';
import { useTheme } from '../theme/ThemeContext';

export default function OrbVisualiser({ state, velocity = 0 }) {
  const { colours } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const isWarning = state === 'warning' || state === 'guillotined';
  const isWriting = state === 'writing' || state === 'saved_by_grace';
  const isCompleted = state === 'completed';

  const ringColour = isWarning ? colours.stateDanger : isCompleted ? colours.stateSuccess : colours.accentGold;
  const dotColour = ringColour;
  const size = 40 + Math.round(velocity * 20);

  useEffect(() => {
    if (isWriting) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        ]),
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: false }),
          Animated.timing(glowAnim, { toValue: 0.3, duration: 1200, useNativeDriver: false }),
        ]),
      ).start();
    } else if (isWarning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 400, useNativeDriver: false }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: false }),
        ]),
      ).start();
      Animated.timing(glowAnim, { toValue: 1, duration: 300, useNativeDriver: false }).start();
    } else if (isCompleted) {
      Animated.timing(pulseAnim, { toValue: 1.5, duration: 500, easing: Easing.out(Easing.back(2)), useNativeDriver: false }).start();
      Animated.timing(glowAnim, { toValue: 0, duration: 1000, useNativeDriver: false }).start();
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0.3);
    }
  }, [state, isWriting, isWarning, isCompleted]);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 12 }}>
      <Animated.View style={{
        width: size, height: size, borderRadius: size / 2,
        borderWidth: 2, borderColor: ringColour,
        alignItems: 'center', justifyContent: 'center',
        transform: [{ scale: pulseAnim }],
        shadowColor: ringColour,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: glowAnim,
        shadowRadius: 12,
        elevation: isWarning ? 8 : 4,
      }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: dotColour }} />
      </Animated.View>
    </View>
  );
}
