import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
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
import HistoryView from './components/HistoryView';

function timeAgo(date) {
  const hours = Math.floor((Date.now() - date.getTime()) / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

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
  const [aiMode, setAiMode] = useState('coach');
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
  const isDanger = sessionState === 'guillotined';

  const recentVault = entries.slice(0, 3);

  return (
    <Routes>
      <Route path="/history" element={<HistoryView />} />
      <Route path="/" element={
        <div className="h-screen flex flex-col">
          <div className="flex-1 min-h-0 flex flex-col p-3 md:p-8 max-w-7xl mx-auto w-full gap-4 md:gap-6">
            <Header syncStatus={syncStatus} onOpenVault={handleOpenVault} />

            <main className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6 flex-1 min-h-0">
              <div className="order-1 lg:col-span-3 min-h-0">
                <WritingArena
                  state={sessionState}
                  text={text}
                  onChange={handleTextChange}
                  timerData={timerData}
                  wordCount={wordCount}
                  wordTarget={wordTarget}
                  graceTokens={graceTokens}
                  aiMode={aiMode}
                  onUseGraceToken={handleUseGraceToken}
                  onGiveUp={handleGiveUp}
                  onReset={handleReset}
                />
              </div>

              <div className="order-2 lg:col-span-2 flex flex-col gap-4 md:gap-6">
                <FlowOrb state={sessionState} velocity={velocity} streak={streak} graceTokens={graceTokens} wordCount={wordCount} wordTarget={wordTarget} />

                <div className="sticky top-4 flex flex-col gap-4 md:gap-6">
                  <SessionSetup
                    duration={duration}
                    onDurationChange={setDuration}
                    wordTarget={wordTarget}
                    onTargetChange={setWordTarget}
                    aiMode={aiMode}
                    onAiModeChange={setAiMode}
                    onStart={handleStart}
                    isRunning={isRunning}
                    sessionState={sessionState}
                    graceTokens={graceTokens}
                    streak={streak}
                  />

                  <SensoryLayer
                    frequency={frequency}
                    onFrequencyChange={handleFrequencyChange}
                    isMuted={isMuted}
                    onMuteToggle={handleMuteToggle}
                  />
                </div>
              </div>
            </main>

            {!isRunning && recentVault.length > 0 && (
              <div className="vault-strip glass-panel rounded-[1rem]">
                <span className="text-xxs font-mono-custom text-stone-500 uppercase tracking-wider mr-2">Vault</span>
                {recentVault.map((v) => (
                  <div key={v.id} className="vault-item">
                    <span className={`vault-dot green`}></span>
                    <span className="text-stone-400">{(v.content || '').slice(0, 40)}</span>
                    <span className="text-stone-600">{timeAgo(new Date(v.deleted_at))}</span>
                  </div>
                ))}
                <button onClick={handleOpenVault} className="text-xxs text-champagne font-mono-custom ml-auto hover:underline">
                  View all →
                </button>
              </div>
            )}
          </div>

          <VaultModal
            open={vaultOpen}
            onClose={handleCloseVault}
            entries={entries}
            loading={loading}
            error={vaultError}
            onRefresh={fetchEntries}
            onRecover={handleRecover}
          />

          <footer className="footer flex justify-between items-center px-3 md:px-8 py-2 border-t border-slate-gray/60 text-xxs font-mono-custom" style={{ color: '#444441' }}>
            <span>DeepFlow ADHD Writing Instrument © 2026</span>
            <span>v0.6.0</span>
          </footer>
        </div>
      } />
    </Routes>
  );
}
