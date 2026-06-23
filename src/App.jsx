import React, { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useDeepFlowSession } from './hooks/useDeepFlowSession';
import { useGraveyard } from './hooks/useGraveyard';
import { useBinauralAudio } from './hooks/useBinauralAudio';
import { STATES } from '@architect/session';
import Header from './components/Header';
import WritingArena from './components/WritingArena';
import FlowOrb from './components/FlowOrb';
import SessionSetup from './components/SessionSetup';
import SensoryLayer from './components/SensoryLayer';
import VaultModal from './components/VaultModal';

export default function App() {
  const {
    sessionState,
    timerData,
    syncStatus,
    graceTokens,
    streak,
    velocity,
    start,
    keystroke,
    useGraceToken,
    giveUp,
    reset,
    setAuth,
  } = useDeepFlowSession();

  const {
    entries,
    loading,
    error: vaultError,
    fetchEntries,
    recoverLatest,
    recoveredContent,
    clearRecovered,
  } = useGraveyard();

  const audio = useBinauralAudio();
  const prevStateRef = useRef(sessionState);

  const [duration, setDuration] = useState(25);
  const [wordTarget, setWordTarget] = useState(300);
  const [text, setText] = useState('');
  const [frequency, setFrequency] = useState('off');
  const [isMuted, setIsMuted] = useState(false);
  const [userId, setUserId] = useState(null);
  const [vaultOpen, setVaultOpen] = useState(false);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  useEffect(() => {
    if (prevStateRef.current !== sessionState) {
      audio.updateState(sessionState);
      prevStateRef.current = sessionState;
    }
  }, [sessionState, audio]);

  useEffect(() => {
    supabase.auth.signInAnonymously().then(({ data, error }) => {
      if (error) {
        console.warn('[Auth] signInAnonymously failed, falling back to local:', error.message);
        return;
      }
      const { user, session } = data;
      if (user && session) {
        setUserId(user.id);
        setAuth(user.id, session.access_token);
      }
    });
  }, [setAuth]);

  useEffect(() => {
    if (recoveredContent) {
      setText(recoveredContent);
      keystroke(recoveredContent);
      clearRecovered();
      setVaultOpen(false);
    }
  }, [recoveredContent, keystroke, clearRecovered]);

  const handleOpenVault = useCallback(() => setVaultOpen(true), []);

  const handleCloseVault = useCallback(() => setVaultOpen(false), []);

  const handleRecover = useCallback((entry) => {
    setText(entry.content);
    keystroke(entry.content);
    setVaultOpen(false);
  }, [keystroke]);

  const handleStart = useCallback(() => {
    start(duration, wordTarget, userId);
  }, [start, duration, wordTarget, userId]);

  const handleTextChange = useCallback((value) => {
    setText(value);
    keystroke(value);
  }, [keystroke]);

  const handleUseGraceToken = useCallback(() => {
    useGraceToken();
  }, [useGraceToken]);

  const handleGiveUp = useCallback(() => {
    giveUp();
    setText('');
  }, [giveUp]);

  const handleReset = useCallback(() => {
    reset();
    setText('');
  }, [reset]);

  const handleFrequencyChange = useCallback((mode) => {
    setFrequency(mode);
    if (mode === 'off' || isMuted) {
      audio.stop();
    } else {
      audio.start(mode);
    }
  }, [audio, isMuted]);

  const handleMuteToggle = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) {
        audio.stop();
      } else if (frequency !== 'off') {
        audio.start(frequency);
      }
      return next;
    });
  }, [audio, frequency]);

  const isRunning = sessionState !== STATES.IDLE;

  return (
    <div className="min-h-screen noise-overlay flex flex-col justify-between p-3 md:p-8 max-w-7xl mx-auto">

      <Header syncStatus={syncStatus} onOpenVault={handleOpenVault} />

      <main className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6 items-stretch flex-grow">

        <div className="order-1 lg:col-span-3">
          <WritingArena
            state={sessionState}
            text={text}
            onChange={handleTextChange}
            timerData={timerData}
            wordCount={wordCount}
            wordTarget={wordTarget}
            graceTokens={graceTokens}
            onUseGraceToken={handleUseGraceToken}
            onGiveUp={handleGiveUp}
            onReset={handleReset}
          />
        </div>

        <div className="order-2 lg:col-span-2 flex flex-col gap-4 md:gap-6">
          <div className="order-1 md:order-1">
            <FlowOrb state={sessionState} velocity={velocity} />
          </div>

          <div className="order-3 md:order-2">
            <SensoryLayer
              frequency={frequency}
              onFrequencyChange={handleFrequencyChange}
              isMuted={isMuted}
              onMuteToggle={handleMuteToggle}
            />
          </div>

          <div className="order-2 md:order-3 sticky bottom-0 md:static">
            <SessionSetup
              duration={duration}
              onDurationChange={setDuration}
              wordTarget={wordTarget}
              onTargetChange={setWordTarget}
              onStart={handleStart}
              isRunning={isRunning}
              sessionState={sessionState}
              graceTokens={graceTokens}
              streak={streak}
            />
          </div>
        </div>
      </main>

      <VaultModal
        open={vaultOpen}
        onClose={handleCloseVault}
        entries={entries}
        loading={loading}
        error={vaultError}
        onRefresh={fetchEntries}
        onRecover={handleRecover}
      />

      <footer className="mt-6 md:mt-8 pt-4 border-t border-slate-gray/40 flex justify-between items-center text-stone-500 text-xxs font-mono-custom">
        <span>DeepFlow ADHD Writing Instrument © 2026</span>
        <span>v0.4.0 (Phase 4 — Refined)</span>
      </footer>
    </div>
  );
}
