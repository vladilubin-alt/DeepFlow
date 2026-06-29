import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function ProgressBar({ fraction, height }) {
  const { colours } = useTheme();
  const fillAnim = useRef(new Animated.Value(0)).current;

  const fillWidth = Math.min(Math.max(fraction || 0, 0), 1);

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: fillWidth,
      duration: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [fillWidth]);

  const widthInterpolate = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={{ width: '100%', height: height || 3, backgroundColor: colours.backgroundRaised, borderRadius: 2, overflow: 'hidden' }}>
      <Animated.View style={{ width: widthInterpolate, height: '100%', backgroundColor: colours.accentGold, borderRadius: 2 }} />
    </View>
  );
}
