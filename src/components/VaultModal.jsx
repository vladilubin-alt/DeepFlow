import React, { useEffect } from 'react';

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function VaultModal({
  open,
  onClose,
  entries,
  loading,
  error,
  onRefresh,
  onRecover,
  graceTokens = 0,
}) {
  useEffect(() => {
    if (open) onRefresh();
  }, [open, onRefresh]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/80 backdrop-blur-md p-4" role="dialog" aria-modal="true" aria-label="Writing vault">
      <div className="glass-panel rounded-[2.5rem] w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-gray/40">
          <h2 className="text-lg text-ivory font-serif">Recovery Vault</h2>
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-ivory transition text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {loading && (
            <div className="text-stone-400 text-sm font-mono-custom">Loading vault...</div>
          )}

          {error && (
            <div className="text-velvet-crimson text-sm font-mono-custom bg-velvet-crimson/10 p-3 rounded-xl">
              {error}
            </div>
          )}

          {!loading && !error && entries.length === 0 && (
            <div className="text-stone-500 text-sm font-mono-custom text-center py-8">
              No drafts in the vault yet.
              <br />
              <span className="text-xs text-stone-600">
                Abandoned sessions appear here after the guillotine falls.
              </span>
            </div>
          )}

          {!loading && entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-deep-slate rounded-2xl p-4 border border-slate-gray/40 space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-mono-custom text-stone-500">
                <span>{entry.word_count} words</span>
                <span>{formatDate(entry.deleted_at)}</span>
              </div>
              <p className="text-ivory text-sm leading-relaxed line-clamp-3 font-serif">
                {entry.content || '—'}
              </p>
              {entry === entries[0] && (
                graceTokens > 0 ? (
                  <button
                    onClick={() => onRecover(entry)}
                    className="magnetic-btn mt-2 w-full px-4 py-2 rounded-xl bg-champagne text-obsidian font-medium hover:brightness-110 font-mono-custom text-xs transition"
                  >
                    Recover Last Draft ({graceTokens} token{graceTokens !== 1 ? 's' : ''} left)
                  </button>
                ) : (
                  <div className="mt-2 w-full px-4 py-2 rounded-xl bg-velvet-crimson/10 text-velvet-crimson font-mono-custom text-xs text-center border border-velvet-crimson/20">
                    No grace tokens remaining — start a new session to earn more
                  </div>
                )
              )}
            </div>
          ))}
        </div>

        <div className="p-4 pt-3 border-t border-slate-gray/40 text-center text-xxs text-stone-600 font-mono-custom">
          Entries are auto-purged after 30 days.
        </div>
      </div>
    </div>
  );
}
