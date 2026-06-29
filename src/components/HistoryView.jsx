import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionHistory } from '../hooks/useSessionHistory';
import WordCountChart from './WordCountChart';
import StreakCalendar from './StreakCalendar';

function formatDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function statusBadge(status) {
  switch (status) {
    case 'completed': return 'bg-emerald-500/20 text-emerald-400';
    case 'guillotined': return 'bg-velvet-crimson/20 text-velvet-crimson';
    case 'saved_by_grace': return 'bg-champagne/20 text-champagne';
    default: return 'bg-stone-600/20 text-stone-400';
  }
}

export default function HistoryView() {
  const navigate = useNavigate();
  const {
    sessions, loading, error, streak,
    totalWords, totalSessions,
    selected, setSelected, focusScore, refresh,
  } = useSessionHistory();

  return (
    <div className="min-h-screen noise-overlay flex flex-col p-3 md:p-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl text-champagne font-serif italic">
            Flow History
          </h1>
          <p className="text-xs text-slate-heading font-sans mt-0.5 uppercase tracking-widest">
            Focus Timer Analytics — ADHD Writing Consistency
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="magnetic-btn px-4 py-2 rounded-full text-xs font-mono-custom bg-deep-slate border border-slate-gray/60 text-stone-400 hover:text-champagne hover:border-champagne/40 transition"
          aria-label="Back to writing timer"
        >
          Back to Timer
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
        <div className="glass-panel rounded-[2rem] p-5 md:col-span-1">
          <h2 className="text-xs text-slate-heading font-sans uppercase tracking-widest mb-4">
            Focus Streak
          </h2>
          <StreakCalendar streak={streak} sessions={sessions} />
        </div>

        <div className="glass-panel rounded-[2rem] p-5 md:col-span-2">
          <h2 className="text-xs text-slate-heading font-sans uppercase tracking-widest mb-4">
            Word Count Trend — Deep Work Timer
          </h2>
          {loading ? (
            <div className="text-stone-500 text-sm font-mono-custom py-12 text-center">Loading...</div>
          ) : (
            <WordCountChart sessions={sessions} />
          )}
        </div>
      </div>

      <div className="glass-panel rounded-[2rem] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs text-slate-heading font-sans uppercase tracking-widest">
            Sessions — Pomodoro Writing Log
          </h2>
          <div className="flex items-center gap-4 text-xs font-mono-custom text-stone-500">
            <span>{totalSessions} sessions</span>
            <span className="text-stone-600">|</span>
            <span>{totalWords} total words</span>
          </div>
        </div>

        {error && (
          <div className="text-velvet-crimson text-sm font-mono-custom bg-velvet-crimson/10 p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {!loading && sessions.length === 0 && !error && (
          <div className="text-stone-500 text-sm font-mono-custom text-center py-12">
            No sessions recorded yet. Start a timer from the main view.
          </div>
        )}

        <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
          {sessions.map((s) => {
            const score = !selected || selected.id !== s.id
              ? null
              : focusScore;
            return (
              <button
                key={s.id}
                onClick={() => setSelected(selected?.id === s.id ? null : s)}
                className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                  selected?.id === s.id
                    ? 'bg-champagne/10 border border-champagne/30'
                    : 'bg-deep-slate border border-transparent hover:border-slate-gray/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-xxs font-mono-custom ${statusBadge(s.status)}`}>
                      {s.status}
                    </span>
                    <span className="text-xs text-ivory font-mono-custom">
                      {s.words_written} words
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xxs text-stone-500 font-mono-custom">
                    <span>{formatDuration(s.duration_seconds)}</span>
                    <span>{formatDate(s.started_at)}</span>
                  </div>
                </div>

                {selected?.id === s.id && focusScore !== null && (
                  <div className="mt-3 pt-3 border-t border-slate-gray/40 grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-lg text-champagne font-mono-custom">{focusScore}</div>
                      <div className="text-xxs text-stone-500">Focus Score</div>
                    </div>
                    <div>
                      <div className="text-lg text-ivory font-mono-custom">
                        {s.duration_seconds > 0
                          ? Math.round(s.words_written / (s.duration_seconds / 60))
                          : 0}
                      </div>
                      <div className="text-xxs text-stone-500">WPM</div>
                    </div>
                    <div>
                      <div className="text-lg text-ivory font-mono-custom">
                        {s.target_words > 0
                          ? Math.round((s.words_written / s.target_words) * 100)
                          : 0}%
                      </div>
                      <div className="text-xxs text-stone-500">Target</div>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-gray/40 text-center">
          <button
            onClick={refresh}
            className="magnetic-btn px-4 py-1.5 rounded-full text-xxs font-mono-custom bg-deep-slate border border-slate-gray/60 text-stone-400 hover:text-champagne transition"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
