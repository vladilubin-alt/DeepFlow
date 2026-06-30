import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Linking, Modal, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { track } from '../services/AnalyticsService';
import { markReviewPrompted, setReviewCooldown } from '../lib/reviewManager';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.deepflowmobile';

function ConfettiBurst({ colours }) {
  const particles = useRef(
    Array.from({ length: 20 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(1),
      scale: new Animated.Value(0),
      hue: Math.random() * 30 + 30,
    }))
  ).current;

  useEffect(() => {
    const anim = Animated.stagger(30, particles.map((p) =>
      Animated.parallel([
        Animated.timing(p.scale, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(p.y, { toValue: -(80 + Math.random() * 120), duration: 600, useNativeDriver: true }),
        Animated.timing(p.x, { toValue: (Math.random() - 0.5) * 120, duration: 600, useNativeDriver: true }),
        Animated.timing(p.opacity, { toValue: 0, delay: 400, duration: 300, useNativeDriver: true }),
      ])
    ));
    anim.start();
    return () => anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0, zIndex: 10, pointerEvents: 'none' }}>
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: `hsl(${p.hue}, 80%, 60%)`,
            opacity: p.opacity,
            transform: [
              { translateX: p.x },
              { translateY: p.y },
              { scale: p.scale },
            ],
          }}
        />
      ))}
    </View>
  );
}

export default function FirstPurchaseReviewModal({ visible, onClose }) {
  const { colours } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      track('Review Prompt Shown', { source: 'first_purchase' });
    } else {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleRate = async () => {
    track('Review Prompt Rated', { source: 'first_purchase' });
    await markReviewPrompted();
    Linking.openURL(PLAY_STORE_URL);
    onClose();
  };

  const handleLater = async () => {
    track('Review Prompt Dismissed', { source: 'first_purchase' });
    await setReviewCooldown();
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={handleLater}>
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
      }}>
        <Animated.View style={{
          backgroundColor: '#0D0D12',
          borderRadius: 20,
          padding: 24,
          width: '100%',
          maxWidth: 340,
          borderWidth: 0.5,
          borderColor: '#C9A84C30',
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
          overflow: 'hidden',
        }}>
          <View style={{
            ...StyleSheet.absoluteFillObject,
            opacity: 0.05,
            backgroundColor: '#C9A84C',
          }} />
          <ConfettiBurst colours={colours} />

          <Text style={{
            fontSize: 15,
            fontWeight: '500',
            textAlign: 'center',
            marginBottom: 4,
            color: '#C9A84C',
            letterSpacing: 0.3,
          }}>
            Your flow is now secured.
          </Text>

          <Text style={{
            fontSize: 11,
            color: '#FAF8F5',
            textAlign: 'center',
            lineHeight: 18,
            marginBottom: 24,
            letterSpacing: 0.2,
          }}>
            By investing in DeepFlow, you've chosen to move faster than your inner critic. Your rating helps other ADHD builders find their focus and beat the shame spiral.
          </Text>

          <TouchableOpacity
            onPress={handleRate}
            activeOpacity={0.85}
            style={{
              backgroundColor: '#C9A84C',
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Text style={{
              fontSize: 13,
              fontWeight: '600',
              color: '#0D0D12',
              letterSpacing: 0.5,
            }}>
              Rate DeepFlow
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLater}
            activeOpacity={0.7}
            style={{
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: 'center',
              backgroundColor: 'transparent',
              borderWidth: 0.5,
              borderColor: '#C9A84C30',
            }}
          >
            <Text style={{
              fontSize: 11,
              color: '#C9A84C80',
              letterSpacing: 0.3,
            }}>
              Maybe later
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}
