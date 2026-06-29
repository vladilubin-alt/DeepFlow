import React, { useEffect, useRef } from 'react';
import { View, Text, TextInput, Animated } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const REJECTION_LABELS = {
  word_too_long: 'Word too long (max 25 chars)',
  repetitive: 'Repetitive characters detected',
  keyboard_walk: 'Keyboard walking detected',
  no_vowels: 'No vowels in word',
  consonant_cluster: 'Consonant cluster too long',
  vowel_cluster: 'Vowel cluster too long',
  repeated_words: 'Same word repeated 3+ times',
};

export default function WritingArea({ text, onTextChange, editable, fadingText, state, validationWarning }) {
  const { colours } = useTheme();
  const isDanger = state === 'guillotined' || state === 'warning';
  const isRejected = !!validationWarning;
  const bgColour = isDanger ? colours.backgroundDanger : isRejected ? colours.stateDangerBg : colours.backgroundSurface;
  const borderColour = isRejected ? colours.stateDanger : 'transparent';

  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRejected) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -8, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -4, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 4, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]).start();
    }
  }, [validationWarning]);

  return (
    <Animated.View style={{
      backgroundColor: bgColour,
      borderRadius: 8,
      minHeight: '30%',
      padding: 14,
      marginVertical: 8,
      borderWidth: isRejected ? 1.5 : 0,
      borderColor: borderColour,
      transform: [{ translateX: shakeAnim }],
    }}>
      {fadingText ? (
        <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#2a2510', position: 'absolute', top: 14, left: 14, right: 14 }}>
          {fadingText}
        </Text>
      ) : null}
      <TextInput
        style={{ fontSize: 12, fontFamily: 'monospace', color: colours.textPrimary, lineHeight: 18, height: '100%' }}
        value={text}
        onChangeText={onTextChange}
        editable={editable !== false}
        multiline
        textAlignVertical="top"
        placeholder="Start writing..."
        placeholderTextColor={colours.textDisabled}
        accessibilityLabel="Writing area"
        accessibilityHint="Type your writing here during the focus session"
      />
      {isRejected && (
        <View style={{
          position: 'absolute',
          bottom: 8,
          left: 14,
          right: 14,
          backgroundColor: colours.stateDangerBg,
          borderRadius: 4,
          paddingHorizontal: 8,
          paddingVertical: 4,
        }}>
          <Text style={{ fontSize: 10, color: colours.stateDanger, fontFamily: 'monospace' }}>
            {REJECTION_LABELS[validationWarning] || validationWarning}
          </Text>
        </View>
      )}
    </Animated.View>
  );
}
