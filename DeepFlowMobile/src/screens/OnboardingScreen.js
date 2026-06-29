import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { FLARES, completeOnboarding } from '../services/FlareQuizService';

const { width } = Dimensions.get('window');

const DESIRED_STATES = [
  { id: 'momentum', label: 'Momentum', emoji: '🚀', description: 'Keep moving forward without friction' },
  { id: 'groove', label: 'Groove', emoji: '🎵', description: 'Find your rhythm and stay in it' },
  { id: 'clear_conscience', label: 'Clear Conscience', emoji: '✨', description: 'Write without guilt or self-judgment' },
  { id: 'velocity', label: 'Velocity', emoji: '⚡', description: 'Output fast, edit later, ship always' },
];

const ANALYSIS_STEPS = [
  'Analyzing flare_type...',
  'Securing Recovery Vault...',
  'Activating Forgiving Guillotine...',
  'Calibrating focus engine...',
  'Ready.',
];

export default function OnboardingScreen({ onComplete }) {
  const { colours } = useTheme();
  const [step, setStep] = useState(0);
  const [selectedFlare, setSelectedFlare] = useState(null);
  const [selectedDesired, setSelectedDesired] = useState(null);
  const [analysisIdx, setAnalysisIdx] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const animateIn = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => { animateIn(); }, [step]);

  useEffect(() => {
    if (step === 4) {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        if (i < ANALYSIS_STEPS.length) {
          setAnalysisIdx(i);
        } else {
          clearInterval(interval);
          setTimeout(() => setStep(5), 600);
        }
      }, 800);
      return () => clearInterval(interval);
    }
  }, [step]);

  const goNext = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    setStep((s) => s + 1);
  };

  const handleFlareSelect = (flare) => {
    setSelectedFlare(flare);
    goNext();
  };

  const handleDesiredSelect = (state) => {
    setSelectedDesired(state);
    goNext();
  };

  const handleFinish = async () => {
    await completeOnboarding(selectedFlare.id);
    onComplete(selectedFlare.id);
  };

  const renderHook = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.heroText, { color: colours.textPrimary }]}>
        Writing isn't your problem.
      </Text>
      <Text style={[styles.heroAccent, { color: colours.accentGold }]}>
        Your environment is.
      </Text>
      <Text style={[styles.subText, { color: colours.textMuted }]}>
        DeepFlow adapts to how your brain actually works — not how productivity apps think it should.
      </Text>
      <TouchableOpacity onPress={goNext} style={[styles.ctaButton, { backgroundColor: colours.accentGold }]}>
        <Text style={[styles.ctaText, { color: colours.accentGoldText }]}>Show Me</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSocialProof = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.heroText, { color: colours.textPrimary, fontSize: 24 }]}>
        Stop fighting your neurobiology.
      </Text>
      <Text style={[styles.subText, { color: colours.textMuted, marginTop: 16, lineHeight: 24 }]}>
        Most apps use "Boring Timers" that trigger a{' '}
        <Text style={{ color: colours.stateDanger, fontWeight: '600' }}>Shame-Based Failure State</Text>.
      </Text>
      <Text style={[styles.subText, { color: colours.textMuted, marginTop: 12, lineHeight: 24 }]}>
        DeepFlow uses a high-velocity{' '}
        <Text style={{ color: colours.accentGold, fontWeight: '600' }}>consequence engine</Text>{' '}
        to snap you out of the fog and keep you in the zone.
      </Text>
      <View style={[styles.visualCard, { backgroundColor: colours.backgroundSurface, borderColor: colours.borderSubtle, marginTop: 24 }]}>
        <View style={styles.orbAnimation}>
          <View style={[styles.orbDot, { backgroundColor: colours.stateSuccess }]} />
          <View style={[styles.orbLine, { backgroundColor: colours.accentGold }]} />
          <View style={[styles.orbDot, { backgroundColor: colours.stateDanger }]} />
          <View style={[styles.orbLine, { backgroundColor: colours.accentGold }]} />
          <View style={[styles.orbDot, { backgroundColor: colours.stateSuccess }]} />
        </View>
        <View style={styles.orbLabels}>
          <Text style={[styles.orbLabel, { color: colours.textMuted }]}>Writing</Text>
          <Text style={[styles.orbLabel, { color: colours.textMuted }]}>Warning</Text>
          <Text style={[styles.orbLabel, { color: colours.textMuted }]}>Writing</Text>
        </View>
      </View>
      <TouchableOpacity onPress={goNext} style={[styles.ctaButton, { backgroundColor: colours.accentGold }]}>
        <Text style={[styles.ctaText, { color: colours.accentGoldText }]}>Enter the Arena</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFlareQuiz = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.sectionTitle, { color: colours.textPrimary }]}>
        Which feels most like you?
      </Text>
      <Text style={[styles.subText, { color: colours.textMuted, marginBottom: 20 }]}>
        Select your writing flare type
      </Text>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {FLARES.map((flare) => (
          <TouchableOpacity
            key={flare.id}
            onPress={() => handleFlareSelect(flare)}
            style={[styles.quizOption, { backgroundColor: colours.backgroundSurface, borderColor: colours.borderSubtle }]}
          >
            <Text style={styles.quizEmoji}>{flare.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.quizLabel, { color: colours.textPrimary }]}>{flare.label}</Text>
              <Text style={[styles.quizDesc, { color: colours.textMuted }]}>{flare.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderDesiredState = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.sectionTitle, { color: colours.textPrimary }]}>
        What do you want to feel?
      </Text>
      <Text style={[styles.subText, { color: colours.textMuted, marginBottom: 20 }]}>
        Your desired writing state
      </Text>
      {DESIRED_STATES.map((state) => (
        <TouchableOpacity
          key={state.id}
          onPress={() => handleDesiredSelect(state)}
          style={[styles.quizOption, { backgroundColor: colours.backgroundSurface, borderColor: colours.borderSubtle }]}
        >
          <Text style={styles.quizEmoji}>{state.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.quizLabel, { color: colours.textPrimary }]}>{state.label}</Text>
            <Text style={[styles.quizDesc, { color: colours.textMuted }]}>{state.description}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderAnalysis = () => (
    <View style={[styles.stepContainer, { justifyContent: 'center' }]}>
      <Text style={[styles.heroAccent, { color: colours.accentGold, marginBottom: 40 }]}>
        {selectedFlare?.emoji} {selectedFlare?.label}
      </Text>
      {ANALYSIS_STEPS.slice(0, analysisIdx + 1).map((text, i) => (
        <Animated.Text
          key={i}
          style={{
            fontSize: 14,
            color: i === analysisIdx ? colours.accentGold : colours.textMuted,
            fontFamily: 'monospace',
            marginBottom: 12,
            opacity: fadeAnim,
          }}
        >
          {i < analysisIdx ? '✓' : '▸'} {text}
        </Animated.Text>
      ))}
    </View>
  );

  const renderPaywall = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.sectionTitle, { color: colours.textPrimary, marginBottom: 8 }]}>
        Unlock Your Full Potential
      </Text>
      <Text style={[styles.subText, { color: colours.textMuted, marginBottom: 24 }]}>
        Start with 3 free Grace Tokens. Upgrade for unlimited focus.
      </Text>

      {/* Trial Explainer */}
      <View style={[styles.trialCard, { backgroundColor: colours.backgroundSurface }]}>
        <Text style={[styles.trialTitle, { color: colours.accentGold }]}>How the trial works</Text>
        <View style={styles.trialStep}>
          <Text style={[styles.trialDay, { color: colours.accentGold }]}>Day 0</Text>
          <Text style={[styles.trialDesc, { color: colours.textPrimary }]}>Unlock everything — $0</Text>
        </View>
        <View style={styles.trialStep}>
          <Text style={[styles.trialDay, { color: colours.accentGold }]}>Day 2</Text>
          <Text style={[styles.trialDesc, { color: colours.textPrimary }]}>We'll remind you before billing</Text>
        </View>
        <View style={styles.trialStep}>
          <Text style={[styles.trialDay, { color: colours.accentGold }]}>Day 3</Text>
          <Text style={[styles.trialDesc, { color: colours.textPrimary }]}>Billing starts — cancel anytime</Text>
        </View>
      </View>

      {/* Price Anchoring */}
      <View style={[styles.priceCard, { backgroundColor: colours.accentGold + '15', borderColor: colours.accentGold }]}>
        <Text style={[styles.priceLabel, { color: colours.accentGold }]}>BEST VALUE</Text>
        <Text style={[styles.priceAmount, { color: colours.textPrimary }]}>$39.99/year</Text>
        <Text style={[styles.priceSub, { color: colours.textMuted }]}>3-day free trial · $3.33/month</Text>
        <Text style={[styles.priceSave, { color: colours.stateSuccess }]}>Save 83% vs weekly</Text>
      </View>

      <View style={[styles.priceCard, { backgroundColor: colours.backgroundSurface, borderColor: colours.borderSubtle }]}>
        <Text style={[styles.priceAmount, { color: colours.textPrimary, fontSize: 24 }]}>$4.99/week</Text>
        <Text style={[styles.priceSub, { color: colours.textMuted }]}>No trial · Cancel anytime</Text>
      </View>

      <TouchableOpacity onPress={handleFinish} style={[styles.ctaButton, { backgroundColor: colours.accentGold }]}>
        <Text style={[styles.ctaText, { color: colours.accentGoldText }]}>Start Free Trial</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleFinish} style={{ alignItems: 'center', paddingVertical: 12 }}>
        <Text style={{ fontSize: 12, color: colours.textMuted }}>Maybe later</Text>
      </TouchableOpacity>
    </View>
  );

  const steps = [renderHook, renderSocialProof, renderFlareQuiz, renderDesiredState, renderAnalysis, renderPaywall];

  return (
    <View style={[styles.container, { backgroundColor: colours.backgroundBase }]}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {steps[step]()}
      </Animated.View>
      {/* Progress dots */}
      <View style={styles.dots}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <View
            key={i}
            style={[styles.dot, {
              backgroundColor: i <= step ? colours.accentGold : colours.borderSubtle,
              width: i === step ? 20 : 6,
            }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = {
  container: { flex: 1, paddingTop: 60 },
  stepContainer: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  heroText: { fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  heroAccent: { fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  subText: { fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  ctaButton: { borderRadius: 12, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 32 },
  ctaText: { fontSize: 15, fontWeight: '600' },
  quizOption: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 0.5 },
  quizEmoji: { fontSize: 28, marginRight: 14 },
  quizLabel: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  quizDesc: { fontSize: 12, lineHeight: 18 },
  visualCard: { borderRadius: 16, padding: 20, borderWidth: 0.5, alignItems: 'center' },
  orbAnimation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  orbDot: { width: 12, height: 12, borderRadius: 6 },
  orbLine: { width: 40, height: 2 },
  orbLabels: { flexDirection: 'row', justifyContent: 'space-between', width: '80%' },
  orbLabel: { fontSize: 10, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 0.5 },
  trialCard: { borderRadius: 16, padding: 20, marginBottom: 16 },
  trialTitle: { fontSize: 14, fontWeight: '600', marginBottom: 16 },
  trialStep: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  trialDay: { fontSize: 12, fontWeight: '700', width: 50, fontFamily: 'monospace' },
  trialDesc: { fontSize: 13, flex: 1 },
  priceCard: { borderRadius: 16, padding: 20, marginBottom: 12, borderWidth: 1, alignItems: 'center' },
  priceLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
  priceAmount: { fontSize: 28, fontWeight: '700', marginBottom: 4 },
  priceSub: { fontSize: 12, marginBottom: 4 },
  priceSave: { fontSize: 11, fontWeight: '600' },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingBottom: 40 },
  dot: { height: 6, borderRadius: 3 },
};
