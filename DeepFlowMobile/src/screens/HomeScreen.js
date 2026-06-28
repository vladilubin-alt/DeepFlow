import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import TopBar from '../components/TopBar';
import StatStrip from '../components/StatStrip';
import SegmentedControl from '../components/SegmentedControl';
import { getStoredFlare } from '../services/FlareQuizService';
import { getFlareDefaults } from '../services/FlareConfig';
import { supabase } from '../lib/supabase';

const durationOpts = ['3m', '5m', '10m', '25m', '45m', '60m'];
const wordTargetOpts = ['25', '50', '100', '300', '500', '750'];
const sensoryOpts = ['off', 'alpha', 'beta'];
const aiModeOpts = ['silent', 'coach', 'demon'];

const DURATION_VALS = [3, 5, 10, 25, 45, 60];
const WORD_VALS = [25, 50, 100, 300, 500, 750];

const VAULT_CACHE_KEY = '@deepflow/vault_entries';

function calcStreak(sessions) {
  const activeDates = new Set(
    (sessions || [])
      .filter(s => s.status === 'completed' || s.status === 'saved_by_grace')
      .map(s => s.started_at?.split('T')[0])
      .filter(Boolean),
  );
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().split('T')[0];
    if (activeDates.has(key)) {
      streak++;
    } else {
      break;
    }
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export default function HomeScreen({ navigation }) {
  const { colours } = useTheme();
  const [durationIdx, setDurationIdx] = useState(0);
  const [wordTargetIdx, setWordTargetIdx] = useState(0);
  const [sensoryIdx, setSensoryIdx] = useState(0);
  const [aiModeIdx, setAiModeIdx] = useState(0);
  const [streak, setStreak] = useState(0);
  const [graceTokens, setGraceTokens] = useState(3);
  const [vaultEntries, setVaultEntries] = useState([]);

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

  // Fetch real streak from sessions
  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        const { data } = await supabase
          .from('writing_sessions')
          .select('started_at, status')
          .order('started_at', { ascending: false })
          .limit(50);
        if (data) setStreak(calcStreak(data));
      } catch (e) {}
    };
    fetchStreak();
  }, []);

  // Fetch grace tokens
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        const { data } = await supabase
          .from('profiles')
          .select('grace_tokens')
          .eq('id', session.user.id)
          .single();
        if (data?.grace_tokens != null) setGraceTokens(data.grace_tokens);
      } catch (e) {}
    };
    fetchTokens();
  }, []);

  // Fetch vault entries for strip
  useEffect(() => {
    const fetchVault = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          const cached = await AsyncStorage.getItem(VAULT_CACHE_KEY).catch(() => null);
          if (cached) setVaultEntries(JSON.parse(cached).slice(0, 3));
          return;
        }
        const { data } = await supabase
          .from('graveyard')
          .select('id, content, word_count, deleted_at')
          .eq('user_id', session.user.id)
          .order('deleted_at', { ascending: false })
          .limit(3);
        if (data) {
          setVaultEntries(data);
          await AsyncStorage.setItem(VAULT_CACHE_KEY, JSON.stringify(data)).catch(() => {});
        }
      } catch (e) {
        const cached = await AsyncStorage.getItem(VAULT_CACHE_KEY).catch(() => null);
        if (cached) setVaultEntries(JSON.parse(cached).slice(0, 3));
      }
    };
    fetchVault();
  }, []);

  const [hapticOn, setHapticOn] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('@deepflow/settings/haptic').then(v => {
      if (v !== null) setHapticOn(v === 'true');
    });
  }, []);

  const hapticTap = useCallback(() => {
    if (hapticOn) {
      try { Vibration.vibrate(100); } catch (e) { console.warn('[Haptic] error:', e.message); }
    }
  }, [hapticOn]);

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

        <StatStrip streak={streak} graceTokens={graceTokens} />

        <View style={{ marginBottom: 14 }}>
          <Text style={{ fontSize: 10, color: colours.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Duration</Text>
          <SegmentedControl options={durationOpts} selectedIndex={durationIdx} onSelect={(i) => { hapticTap(); setDurationIdx(i); }} />
        </View>

        <View style={{ marginBottom: 14 }}>
          <Text style={{ fontSize: 10, color: colours.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Word Target</Text>
          <SegmentedControl options={wordTargetOpts} selectedIndex={wordTargetIdx} onSelect={(i) => { hapticTap(); setWordTargetIdx(i); }} />
        </View>

        <View style={{ marginBottom: 14 }}>
          <Text style={{ fontSize: 10, color: colours.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Sensory Layer</Text>
          <SegmentedControl options={sensoryOpts} selectedIndex={sensoryIdx} onSelect={(i) => { hapticTap(); setSensoryIdx(i); }} />
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 10, color: colours.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>AI Mode</Text>
          <SegmentedControl options={aiModeOpts} selectedIndex={aiModeIdx} onSelect={(i) => { hapticTap(); setAiModeIdx(i); }} />
        </View>

        <TouchableOpacity
          onPress={() => { hapticTap(); startSession(); }}
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

        {/* Vault Strip */}
        {vaultEntries.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <Text style={{ fontSize: 10, color: colours.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Recent Drafts
            </Text>
            {vaultEntries.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => navigation.navigate('Vault')}
                style={{
                  backgroundColor: colours.backgroundSurface,
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 4,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: colours.stateDangerMuted, marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colours.textPrimary }} numberOfLines={1}>
                    {(item.content || '').slice(0, 50) || 'Untitled draft'}
                  </Text>
                  <Text style={{ fontSize: 9, color: colours.textMuted, marginTop: 1 }}>
                    {item.word_count} words
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
