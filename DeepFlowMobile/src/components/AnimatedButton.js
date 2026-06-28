import React from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function AnimatedButton({ title, onPress, style, textStyle, disabled, variant = 'primary', icon }) {
  const { colours } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: colours.backgroundSurface,
          borderWidth: 0.5,
          borderColor: colours.borderMedium,
          textColor: colours.textPrimary,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
          borderColor: 'transparent',
          textColor: colours.accentGold,
        };
      case 'primary':
      default:
        return {
          backgroundColor: colours.accentGold,
          borderWidth: 0,
          borderColor: 'transparent',
          textColor: colours.accentGoldText,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.92}
        style={[
          styles.button,
          {
            backgroundColor: variantStyles.backgroundColor,
            borderWidth: variantStyles.borderWidth,
            borderColor: variantStyles.borderColor,
          },
          style,
        ]}
      >
        <View style={styles.content}>
          {icon ? <Text style={[styles.icon, { color: variantStyles.textColor }]}>{icon}</Text> : null}
          <Text style={[styles.text, { color: variantStyles.textColor }, textStyle]}>
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});