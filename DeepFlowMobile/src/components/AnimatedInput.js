import React, { useRef, useEffect } from 'react';
import { View, Text, TextInput, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function AnimatedInput({ label, value, onChangeText, placeholder, secureTextEntry, error, style }) {
  const { colours } = useTheme();
  const underlineAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (error) {
      const shakeSequence = Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]);
      shakeSequence.start();
    }
  }, [error, shakeAnim]);

  const handleFocus = () => {
    Animated.timing(underlineAnim, {
      toValue: 1,
      duration: 200,
      easing: Animated.easeOut,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    Animated.timing(underlineAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const underlineWidth = underlineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={styles.input}
          placeholderTextColor={colours.textMuted}
        />
        <Animated.View
          style={[
            styles.underline,
            {
              width: underlineWidth,
              backgroundColor: colours.accentGold,
            },
          ]}
        />
      </Animated.View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: '#B4B2A9',
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  input: {
    fontSize: 14,
    color: '#2C2C2A',
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  underline: {
    height: 1,
    marginTop: 4,
  },
  errorText: {
    color: '#E24B4A',
    fontSize: 12,
    marginTop: 4,
  },
});