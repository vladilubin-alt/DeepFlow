import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { GuillotineStateMachine, EVENTS, STATES } from '../logic/GuillotineStateMachine';
import { TimerController } from '../logic/TimerController';
import TopBar from '../components/TopBar';
import TimerDisplay from '../components/TimerDisplay';
import OrbVisualiser from '../components/OrbVisualiser';
import WritingArea from '../components/WritingArea';
import AiNudge from '../components/AiNudge';
import IdleWarning from '../components/IdleWarning';
import GraceTokenButton from '../components/GraceTokenButton';

export default function ActiveSessionScreen({ route, navigation }) {
  const { colours } = useTheme();
  const { durationMinutes, targetWords, sensoryMode, aiMode } = route.params;

  const [state, setState] = useState(STATES.IDLE);
  const [text, setText] = useState('');
  const [timerData, setTimerData] = useState({ remainingMs: durationMinutes * 60 * 1000, elapsedMs: 0, idleSinceMs: 0, warningSinceMs: 0, graceTokens: 3 });
  const [nudge, setNudge] = useState(null);
  const [nudgeTimer, setNudgeTimer] = useState(null);

  const machineRef = useRef(null);
  const timerRef = useRef(null);
  const nudgeIdleRef = useRef(null);

  const handleKeystroke = useCallback((newText) => {
    setText(newText);
    const words = newText.trim().split(/\s+/).filter(Boolean).length;
    if (machineRef.current && timerRef.current) {
      machineRef.current.send(EVENTS.KEYSTROKE, { wordsWritten: words });
      timerRef.current.keystroke();
    }
    setNudge(null);
    if (nudgeIdleRef.current) clearTimeout(nudgeIdleRef.current);
  }, []);

  const useGraceToken = useCallback(() => {
    if (machineRef.current) {
      const ok = machineRef.current.send(EVENTS.USE_GRACE_TOKEN);
      if (!ok) return;
    }
  }, []);

  const dismissNudge = useCallback(() => setNudge(null), []);

  useEffect(() => {
    const totalMs = durationMinutes * 60 * 1000;

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
      if (entry.to === STATES.GUILLOTINED) {
        setNudge('Session guillotined — use a grace token to recover.');
      }
    });

    machine.send(EVENTS.START);
    timer.start();

    machineRef.current = machine;
    timerRef.current = timer;

    return () => {
      timer.destroy();
      machineRef.current = null;
      timerRef.current = null;
    };
  }, [durationMinutes, targetWords]);

  useEffect(() => {
    if (state === STATES.WRITING && aiMode !== 'silent') {
      nudgeIdleRef.current = setTimeout(() => {
        const prompts = [
          'Keep going — the next sentence writes itself.',
          'Breathe. One word after another.',
          'You have more to say than you think.',
          'The guillotine is patient. Stay alive.',
        ];
        setNudge(prompts[Math.floor(Math.random() * prompts.length)]);
      }, 4000);
    }
    return () => {
      if (nudgeIdleRef.current) clearTimeout(nudgeIdleRef.current);
    };
  }, [state, text, aiMode]);

  useEffect(() => {
    if (state === STATES.COMPLETED || state === STATES.GUILLOTINED) {
      navigation.navigate('Home');
    }
  }, [state, navigation]);

  const isWarning = state === STATES.WARNING || state === STATES.GUILLOTINED;
  const syncDot = colours.stateSuccess;
  const syncLabel = 'Connected';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colours.backgroundBase }}>
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 40 }}>
        <TopBar
          subtitle={state === STATES.GUILLOTINED ? 'DANGER' : state === STATES.WARNING ? 'WARNING' : state === STATES.WRITING ? 'WRITING' : 'IDLE'}
          dotColour={isWarning ? colours.stateDanger : colours.stateSuccess}
          labelRight={syncLabel}
        />

        <TimerDisplay
          remainingMs={timerData.remainingMs}
          wordsWritten={machineRef.current?.ctx?.wordsWritten || 0}
          targetWords={targetWords}
        />

        <OrbVisualiser state={state} />

        <WritingArea
          text={text}
          onTextChange={handleKeystroke}
          state={state}
          fadingText={null}
        />

        {state === STATES.GUILLOTINED && (
          <GraceTokenButton count={timerData.graceTokens} onUse={useGraceToken} />
        )}

        {state === STATES.WARNING && (
          <IdleWarning idleMs={timerData.idleSinceMs} thresholdMs={5000} />
        )}

        {nudge && aiMode !== 'silent' && (
          <AiNudge prompt={nudge} onDismiss={dismissNudge} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
