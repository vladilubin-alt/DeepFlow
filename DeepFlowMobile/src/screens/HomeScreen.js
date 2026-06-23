import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import TopBar from '../components/TopBar';
import StatStrip from '../components/StatStrip';
import SegmentedControl from '../components/SegmentedControl';
import { getStoredFlare } from '../services/FlareQuizService';
import { getFlareDefaults } from '../services/FlareConfig';

const durationOpts = ['10m', '25m', '45m', '60m'];
const wordTargetOpts = ['100', '300', '500', '750'];
const sensoryOpts = ['off', 'alpha', 'beta'];
const aiModeOpts = ['silent', 'coach', 'demon'];

const DURATION_VALS = [10, 25, 45, 60];
const WORD_VALS = [100, 300, 500, 750];

export default function HomeScreen({ navigation }) {
  const { colours } = useTheme();
  const [durationIdx, setDurationIdx] = useState(1);
  const [wordTargetIdx, setWordTargetIdx] = useState(1);
  const [sensoryIdx, setSensoryIdx] = useState(0);
  const [aiModeIdx, setAiModeIdx] = useState(0);

  useEffect(() => {
    getStoredFlare().then((flareId) => {
      if (!flareId) return;
      const defaults = getFlareDefaults(flareId);
      const dIdx = DURATION_VALS.indexOf(defaults.durationMinutes);
      const wIdx = WORD_VALS.indexOf(defaults.wordTarget);
      const sIdx = sensoryOpts.indexOf(defaults.sensory);
      const aIdx = aiModeOpts.indexOf(defaults.aiMode);
      if (dIdx >= 0) setDurationIdx(dIdx);
      if (wIdx >= 0) setWordTargetIdx(wIdx);
      if (sIdx >= 0) setSensoryIdx(sIdx);
      if (aIdx >= 0) setAiModeIdx(aIdx);
    });
  }, []);

  const startSession = useCallback(() => {
    navigation.navigate('ActiveSession', {
      durationMinutes: parseInt(durationOpts[durationIdx]),
      targetWords: parseInt(wordTargetOpts[wordTargetIdx]),
      sensoryMode: sensoryOpts[sensoryIdx],
      aiMode: aiModeOpts[aiModeIdx],
    });
  }, [durationIdx, wordTargetIdx, sensoryIdx, aiModeIdx, navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colours.backgroundBase }}>
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 100 }}>
        <TopBar subtitle="ADHD WRITING INSTRUMENT" />

        <StatStrip streak={0} graceTokens={3} />

        <View style={{ marginBottom: 14 }}>
          <Text style={{ fontSize: 10, color: colours.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Duration</Text>
          <SegmentedControl options={durationOpts} selectedIndex={durationIdx} onSelect={setDurationIdx} />
        </View>

        <View style={{ marginBottom: 14 }}>
          <Text style={{ fontSize: 10, color: colours.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Word Target</Text>
          <SegmentedControl options={wordTargetOpts} selectedIndex={wordTargetIdx} onSelect={setWordTargetIdx} />
        </View>

        <View style={{ marginBottom: 14 }}>
          <Text style={{ fontSize: 10, color: colours.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Sensory Layer</Text>
          <SegmentedControl options={sensoryOpts} selectedIndex={sensoryIdx} onSelect={setSensoryIdx} />
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 10, color: colours.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>AI Mode</Text>
          <SegmentedControl options={aiModeOpts} selectedIndex={aiModeIdx} onSelect={setAiModeIdx} />
        </View>

        <TouchableOpacity
          onPress={startSession}
          style={{
            backgroundColor: colours.accentGold,
            borderRadius: 8,
            height: 52,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 14, color: colours.accentGoldText, fontWeight: '500', letterSpacing: 1, textTransform: 'uppercase' }}>
            Start Session
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
