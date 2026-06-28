import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { GuillotineStateMachine, EVENTS, STATES } from '../logic/GuillotineStateMachine';
import { TimerController } from '../logic/TimerController';
import { validateKeystroke } from '../utils/keystrokeValidator';
import { triggerGraceTokenPaywall } from '../services/SuperwallService';
import { track } from '../services/AnalyticsService';
import { startSession, saveSession, saveToGraveyard, syncGraceTokens } from '../services/SessionService';
import { supabase } from '../lib/supabase';
import { useBinauralAudio } from '../services/BinauralAudio';
import TopBar from '../components/TopBar';
import TimerDisplay from '../components/TimerDisplay';
import OrbVisualiser from '../components/OrbVisualiser';
import WritingArea from '../components/WritingArea';
import AiNudge from '../components/AiNudge';
import IdleWarning from '../components/IdleWarning';
import GraceTokenButton from '../components/GraceTokenButton';
import FocusReportModal from '../components/FocusReportModal';

const COACH_PROMPTS = [
  'Keep going — the next sentence writes itself.',
  'Breathe. One word after another.',
  'You have more to say than you think.',
  'The guillotine is patient. Stay alive.',
  'Flow state is one keystroke away.',
];

const DEMON_PROMPTS = [
  'Is that all you have? The words are dying.',
  'You call that writing? The cursor is mocking you.',
  'Every second you waste, the guillotine sharpens.',
  'Pathetic. Even your backspace key is disappointed.',
  'The void stares back. Write or be consumed.',
  'Your draft is begging you. Type something real.',
];

const DRAFT_STORAGE_KEY = '@deepflow/current_draft';

export default function ActiveSessionScreen({ route, navigation }) {
  const { colours } = useTheme();
  const { durationMinutes, targetWords, sensoryMode, aiMode, initialText } = route.params;

  const [state, setState] = useState(STATES.IDLE);
  const [text, setText] = useState(initialText || '');
  const [timerData, setTimerData] = useState({ remainingMs: durationMinutes * 60 * 1000, elapsedMs: 0, idleSinceMs: 0, warningSinceMs: 0, graceTokens: 3 });
  const [nudge, setNudge] = useState(null);
  const [showFocusReport, setShowFocusReport] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [syncStatus, setSyncStatus] = useState('connected');
  const [validationWarning, setValidationWarning] = useState(null);
  const [currentFrequency, setCurrentFrequency] = useState(sensoryMode || 'off');
  const [hapticOn, setHapticOn] = useState(true);
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    const loadGraceTokens = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        const { data } = await supabase
          .from('profiles').select('grace_tokens').eq('id', session.user.id).single();
        if (data?.grace_tokens != null) {
          setTimerData((prev) => ({ ...prev, graceTokens: data.grace_tokens }));
        }
      } catch (e) {}
    };
    loadGraceTokens();
  }, []);

  const machineRef = useRef(null);
  const timerRef = useRef(null);
  const nudgeIdleRef = useRef(null);
  const validationFailCount = useRef(0);
  const validationWarningRef = useRef(null);
  const textRef = useRef(initialText || '');
  const hapticRef = useRef(true);
  const soundRef = useRef(true);
  const binaural = useBinauralAudio();

  // Local draft persistence
  const saveDraftLocally = useCallback(async (content) => {
    try {
      await AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
        content,
        savedAt: Date.now(),
        durationMinutes,
        targetWords,
      }));
    } catch (e) {}
  }, [durationMinutes, targetWords]);

  // Sync status listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((info) => {
      setSyncStatus(info.isConnected ? 'connected' : 'offline');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    AsyncStorage.getItem('@deepflow/settings/haptic').then(v => { if (v !== null) { const on = v === 'true'; setHapticOn(on); hapticRef.current = on; } });
    AsyncStorage.getItem('@deepflow/settings/sound').then(v => { if (v !== null) { const on = v === 'true'; setSoundOn(on); soundRef.current = on; } });
  }, []);

  const handleKeystroke = useCallback((newText) => {
    setText(newText);
    textRef.current = newText;
    const words = newText.trim().split(/\s+/).filter(Boolean).length;

    // Keystroke validation
    const { valid, reason } = validateKeystroke(newText);
    if (!valid) {
      validationFailCount.current++;
      setValidationWarning(reason);
      if (validationWarningRef.current) clearTimeout(validationWarningRef.current);
      validationWarningRef.current = setTimeout(() => setValidationWarning(null), 2000);
      if (validationFailCount.current >= 3 && aiMode !== 'silent') {
        setNudge('Nice try. The guillotine knows gibberish when it sees it.');
        validationFailCount.current = 0;
      }
      return; // Don't count invalid keystrokes
    }
    validationFailCount.current = 0;
    setValidationWarning(null);

    if (machineRef.current && timerRef.current) {
      machineRef.current.send(EVENTS.KEYSTROKE, { wordsWritten: words });
      timerRef.current.keystroke();
    }
    setNudge(null);
    if (nudgeIdleRef.current) clearTimeout(nudgeIdleRef.current);

    // Haptic feedback on keystroke
    if (hapticRef.current) binaural.vibrate(10);

    // Save draft locally (debounced via timeout in useEffect)
  }, [binaural]);

  // Debounced local draft save
  useEffect(() => {
    if (!text) return;
    const timeout = setTimeout(() => saveDraftLocally(text), 3000);
    return () => clearTimeout(timeout);
  }, [text, saveDraftLocally]);

  const useGraceToken = useCallback(() => {
    if (!machineRef.current) return;
    const ok = machineRef.current.send(EVENTS.USE_GRACE_TOKEN);
    if (ok) {
      track('Grace Token Used (manual)', { graceTokens: machineRef.current.ctx.graceTokens });
      if (hapticRef.current) binaural.vibrate([0, 50, 50]);
      syncGraceTokens(machineRef.current.ctx.graceTokens);
      return;
    }
    triggerGraceTokenPaywall(() => {
      const tokens = 3;
      setTimerData((prev) => ({ ...prev, graceTokens: tokens }));
      machineRef.current.ctx.graceTokens = tokens;
      machineRef.current.send(EVENTS.USE_GRACE_TOKEN);
    });
  }, [binaural]);

  const giveUp = useCallback(() => {
    if (!machineRef.current) return;
    track('Session Give Up', { durationMinutes, targetWords, wordsWritten: machineRef.current.ctx.wordsWritten });
    saveSession({
      targetWords,
      wordsWritten: machineRef.current.ctx.wordsWritten,
      durationSeconds: timerData.elapsedMs / 1000,
      guillotined: true,
      graceTokenUsed: false,
    });
    saveToGraveyard(textRef.current, machineRef.current.ctx.wordsWritten);
    machineRef.current.send(EVENTS.GIVE_UP);
    navigation.navigate('Home');
  }, [durationMinutes, targetWords, timerData.elapsedMs, navigation]);

  const dismissNudge = useCallback(() => setNudge(null), []);

  useEffect(() => {
    const machine = new GuillotineStateMachine({
      graceTokens: 3,
      targetWords,
      durationSeconds: durationMinutes * 60,
    });

    const timer = new TimerController(machine, {
      idleThresholdMs: 5000,
      guillotineThresholdMs: 10000,
      onTick: (data) => {
        setTimerData(data);
        setState(data.state);
      },
    });

    machine.on('transition', (entry) => {
      setState(entry.to);
      if (entry.to === STATES.WARNING) {
        binaural.updateState('warning');
        if (hapticRef.current) binaural.vibrate([0, 110, 60, 110]);
      } else if (entry.to === STATES.GUILLOTINED) {
        binaural.updateState('guillotined');
        if (hapticRef.current) binaural.vibrate([0, 200, 100, 200, 0, 200, 100, 200]);
        track('Session Guillotined', { durationMinutes, targetWords, wordsWritten: entry.ctx.wordsWritten });
      } else if (entry.to === STATES.COMPLETED) {
        binaural.updateState('completed');
        if (hapticRef.current) binaural.vibrate([0, 200, 100, 200, 0, 200, 100, 200]);
        track('Session Completed', { durationMinutes, targetWords, wordsWritten: entry.ctx.wordsWritten });
      } else if (entry.to === STATES.SAVED_BY_GRACE) {
        binaural.updateState('writing');
        track('Grace Token Used (auto)', { graceTokens: entry.ctx.graceTokens });
        syncGraceTokens(entry.ctx.graceTokens);
      } else if (entry.to === STATES.WRITING) {
        binaural.updateState('writing');
      }

      if (entry.to === STATES.COMPLETED) {
        const reportPayload = {
          wordsWritten: entry.ctx.wordsWritten,
          targetWords,
          durationSeconds: durationMinutes * 60,
          guillotined: false,
        };
        setReportData(reportPayload);
        setShowFocusReport(true);
        saveSession({
          targetWords,
          wordsWritten: entry.ctx.wordsWritten,
          durationSeconds: durationMinutes * 60,
          guillotined: false,
          graceTokenUsed: false,
        });
      } else if (entry.to === STATES.GUILLOTINED) {
        const elapsed = timerData.elapsedMs / 1000;
        const reportPayload = {
          wordsWritten: entry.ctx.wordsWritten,
          targetWords,
          durationSeconds: elapsed,
          guillotined: true,
        };
        setReportData(reportPayload);
        setShowFocusReport(true);
        saveSession({
          targetWords,
          wordsWritten: entry.ctx.wordsWritten,
          durationSeconds: elapsed,
          guillotined: true,
          graceTokenUsed: false,
        });
        saveToGraveyard(textRef.current, entry.ctx.wordsWritten);
      }
    });

    machine.send(EVENTS.START);
    startSession();
    track('Session Started', { durationMinutes, targetWords, sensoryMode, aiMode });
    timer.start();

    // Start binaural audio if sensory mode selected and sound enabled
    if (soundRef.current && sensoryMode && sensoryMode !== 'off') {
      binaural.start(sensoryMode);
    }

    machineRef.current = machine;
    timerRef.current = timer;

    return () => {
      timer.destroy();
      binaural.stop();
      machineRef.current = null;
      timerRef.current = null;
    };
  }, [durationMinutes, targetWords]);

  // Repeating haptic during warning state
  const warningHapticRef = useRef(null);
  useEffect(() => {
    if (state === STATES.WARNING && hapticRef.current) {
      binaural.vibrate([0, 110, 60, 110]);
      warningHapticRef.current = setInterval(() => {
        if (hapticRef.current) binaural.vibrate([0, 110, 60, 110]);
      }, 3000);
    } else {
      if (warningHapticRef.current) { clearInterval(warningHapticRef.current); warningHapticRef.current = null; }
    }
    return () => { if (warningHapticRef.current) { clearInterval(warningHapticRef.current); warningHapticRef.current = null; } };
  }, [state, binaural]);

  // Nudge logic: trigger during idle warning, not during writing
  useEffect(() => {
    if (state === STATES.WARNING && aiMode !== 'silent') {
      nudgeIdleRef.current = setTimeout(() => {
        const prompts = aiMode === 'demon' ? DEMON_PROMPTS : COACH_PROMPTS;
        setNudge(prompts[Math.floor(Math.random() * prompts.length)]);
      }, 600);
    } else if (state === STATES.WRITING) {
      setNudge(null);
    }
    return () => {
      if (nudgeIdleRef.current) clearTimeout(nudgeIdleRef.current);
    };
  }, [state, aiMode]);

  const dismissFocusReport = useCallback(() => {
    setShowFocusReport(false);
    AsyncStorage.removeItem(DRAFT_STORAGE_KEY);
    navigation.navigate('Home');
  }, [navigation]);

  useEffect(() => {
    if (!showFocusReport && (state === STATES.COMPLETED || state === STATES.GUILLOTINED)) {
      // Don't auto-navigate; wait for user to dismiss report
    }
  }, [state, showFocusReport]);

  const isWarning = state === STATES.WARNING || state === STATES.GUILLOTINED;
  const syncDot = syncStatus === 'connected' ? colours.stateSuccess : colours.stateDanger;
  const syncLabel = syncStatus === 'connected' ? 'Connected' : 'Offline';

  const changeFrequency = useCallback((mode) => {
    setCurrentFrequency(mode);
    if (mode === 'off') {
      binaural.stop();
    } else {
      binaural.start(mode);
    }
  }, [binaural]);

  const toggleMute = useCallback(() => {
    const next = !soundOn;
    setSoundOn(next);
    soundRef.current = next;
    if (next && currentFrequency !== 'off') {
      binaural.start(currentFrequency);
    } else {
      binaural.stop();
    }
  }, [soundOn, currentFrequency, binaural]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colours.backgroundBase }}>
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 40 }}>
        <TopBar
          subtitle={state === STATES.GUILLOTINED ? 'DANGER' : state === STATES.WARNING ? 'WARNING' : state === STATES.WRITING ? 'WRITING' : 'IDLE'}
          dotColour={isWarning ? colours.stateDanger : syncDot}
          labelRight={syncLabel}
        />

        <TimerDisplay
          remainingMs={timerData.remainingMs}
          wordsWritten={machineRef.current?.ctx?.wordsWritten || 0}
          targetWords={targetWords}
          elapsedMs={timerData.elapsedMs}
        />

        <OrbVisualiser state={state} velocity={1 - Math.min(timerData.idleSinceMs / 8000, 1)} />

        {state !== STATES.GUILLOTINED && state !== STATES.COMPLETED && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginVertical: 4 }}>
            {['off', 'alpha', 'beta'].map((mode) => (
              <TouchableOpacity
                key={mode}
                onPress={() => changeFrequency(mode)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 12,
                  backgroundColor: currentFrequency === mode ? colours.accentGold : colours.backgroundSurface,
                }}
              >
                <Text style={{ fontSize: 10, color: currentFrequency === mode ? colours.accentGoldText : colours.textMuted }}>
                  {mode === 'off' ? '🔇' : mode === 'alpha' ? 'α' : 'β'}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={toggleMute} style={{ paddingHorizontal: 8, paddingVertical: 6 }}>
              <Text style={{ fontSize: 12 }}>{soundOn ? '🔊' : '🔇'}</Text>
            </TouchableOpacity>
          </View>
        )}

        <WritingArea
          text={text}
          onTextChange={handleKeystroke}
          state={state}
          fadingText={null}
          validationWarning={validationWarning}
        />

        {state === STATES.GUILLOTINED && (
          <View>
            <GraceTokenButton count={timerData.graceTokens} onUse={useGraceToken} />
            <TouchableOpacity
              onPress={giveUp}
              style={{
                backgroundColor: 'transparent',
                borderRadius: 8,
                paddingVertical: 10,
                alignItems: 'center',
                marginTop: 6,
                borderWidth: 0.5,
                borderColor: colours.textMuted + '40',
              }}
            >
              <Text style={{ fontSize: 11, color: colours.textMuted }}>give up & clear</Text>
            </TouchableOpacity>
          </View>
        )}

        {state === STATES.WARNING && (
          <IdleWarning idleMs={timerData.idleSinceMs} thresholdMs={5000} />
        )}

        {nudge && aiMode !== 'silent' && (
          <AiNudge prompt={nudge} onDismiss={dismissNudge} />
        )}
      </ScrollView>

      <FocusReportModal
        visible={showFocusReport}
        onDismiss={dismissFocusReport}
        wordsWritten={reportData?.wordsWritten ?? 0}
        targetWords={reportData?.targetWords ?? targetWords}
        durationSeconds={reportData?.durationSeconds ?? 0}
        guillotined={reportData?.guillotined ?? false}
      />
    </SafeAreaView>
  );
}
