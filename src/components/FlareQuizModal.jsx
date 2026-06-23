import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const FLARES = [
  { id: 'time_warp', label: 'Time Warp', desc: 'I lose track of time and suddenly the day is gone.' },
  { id: 'task_freeze', label: 'Task Freeze', desc: 'I stare at a blank page and can\'t type the first word.' },
  { id: 'hyperfocus', label: 'Hyperfocus Hijack', desc: 'I get hyper-focused on formatting, research, or perfecting one sentence.' },
  { id: 'decision_fog', label: 'Decision Fog', desc: 'There are too many choices — font, topic, structure — I shut down.' },
  { id: 'crash_guilt', label: 'Crash & Guilt', desc: 'I write a bit, hate it, delete it, and feel like a fraud.' },
];

const CONFIRMATIONS = [
  { id: 'time_warp', label: 'A race I\'m afraid of losing' },
  { id: 'task_freeze', label: 'A safe space with a gentle guide' },
  { id: 'hyperfocus', label: 'Deep immersion where nothing else exists' },
  { id: 'decision_fog', label: 'A clear, minimal path with no options' },
  { id: 'crash_guilt', label: 'Permission to write badly and keep going' },
];

export const FLARE_DEFAULTS = {
  time_warp: { duration: 45, wordTarget: 500, aiMode: 'silent' },
  task_freeze: { duration: 25, wordTarget: 300, aiMode: 'coach' },
  hyperfocus: { duration: 30, wordTarget: 500, aiMode: 'silent' },
  decision_fog: { duration: 25, wordTarget: 300, aiMode: 'coach' },
  crash_guilt: { duration: 15, wordTarget: 100, aiMode: 'demon' },
};

export function getStoredFlare() {
  try {
    return localStorage.getItem('deepflow_flare');
  } catch { return null; }
}

export function isOnboardingComplete() {
  try {
    return localStorage.getItem('deepflow_onboarding_complete') === 'true';
  } catch { return false; }
}

export default function FlareQuizModal({ onComplete }) {
  const [step, setStep] = useState(1);
  const [flareId, setFlareId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const handleSelectFlare = (id) => {
    setFlareId(id);
    setStep(2);
  };

  const handleConfirm = async (id) => {
    const resolved = flareId;
    try {
      localStorage.setItem('deepflow_flare', resolved);
      localStorage.setItem('deepflow_onboarding_complete', 'true');
    } catch {}
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').upsert(
          { id: user.id, flare_type: resolved },
          { onConflict: 'id' },
        );
      }
    } catch (e) {
      console.warn('[FlareQuiz] Supabase profile update:', e.message);
    }
    onComplete(resolved);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(13, 13, 18, 0.95)' }}>
      <div className="w-full max-w-lg" style={{ animation: 'fadeSlideUp 0.4s ease-out' }}>
        <div className="text-center mb-8">
          <div className="text-3xl mb-2" style={{ fontStyle: 'italic', color: '#EF9F27' }}>DeepFlow</div>
          <div className="text-xs text-stone-500 uppercase tracking-widest">ADHD Writing Instrument</div>
        </div>

        {step === 1 && (
          <>
            <div className="text-sm text-ivory font-sans mb-6 text-center leading-relaxed">
              Which feels most like you when you sit down to write?
            </div>
            <div className="space-y-2">
              {FLARES.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleSelectFlare(f.id)}
                  className="w-full text-left p-4 rounded-2xl transition-all duration-200"
                  style={{
                    backgroundColor: 'rgba(30, 26, 14, 0.8)',
                    border: '1px solid rgba(90, 80, 60, 0.3)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#EF9F2740'; e.currentTarget.style.backgroundColor = '#1e1a0e'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(90, 80, 60, 0.3)'; e.currentTarget.style.backgroundColor = 'rgba(30, 26, 14, 0.8)'; }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#EF9F27' }} />
                    <div>
                      <div className="text-sm font-medium text-ivory">{f.label}</div>
                      <div className="text-xs text-stone-500 mt-0.5">{f.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-sm text-ivory font-sans mb-6 text-center leading-relaxed">
              I'd most like my writing session to feel like:
            </div>
            <div className="space-y-2">
              {CONFIRMATIONS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleConfirm(c.id)}
                  className="w-full text-left p-4 rounded-2xl transition-all duration-200"
                  style={{
                    backgroundColor: 'rgba(30, 26, 14, 0.8)',
                    border: '1px solid rgba(90, 80, 60, 0.3)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#EF9F2740'; e.currentTarget.style.backgroundColor = '#1e1a0e'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(90, 80, 60, 0.3)'; e.currentTarget.style.backgroundColor = 'rgba(30, 26, 14, 0.8)'; }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#EF9F27' }} />
                    <div>
                      <div className="text-sm text-ivory">{c.label}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(1)}
              className="w-full text-center mt-4 text-xs text-stone-500 hover:text-stone-400 transition py-2"
            >
              ← Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
