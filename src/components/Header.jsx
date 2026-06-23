import React from 'react';

function syncLabel(status) {
  switch (status) {
    case 'syncing': return 'Syncing…';
    case 'synced': return 'Connected';
    case 'error': return 'Sync Error';
    case 'offline': return 'Offline';
    default: return 'Connected';
  }
}

function syncDotColor(status) {
  switch (status) {
    case 'syncing': return 'bg-champagne animate-pulse';
    case 'synced': return 'bg-emerald-500';
    case 'error': return 'bg-velvet-crimson';
    case 'offline': return 'bg-slate-gray';
    default: return 'bg-emerald-500';
  }
}

export default function Header({ syncStatus, onOpenVault }) {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-3xl md:text-4xl text-champagne font-serif italic tracking-wide">DeepFlow</h1>
        <p className="text-xs text-stone-400 font-sans mt-0.5 uppercase tracking-widest">ADHD Writing Instrument</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenVault}
          className="magnetic-btn px-4 py-2 rounded-full text-xs font-mono-custom bg-deep-slate border border-slate-gray/60 text-stone-400 hover:text-champagne hover:border-champagne/40 transition"
        >
          Vault ◆
        </button>

        <div className="magnetic-btn flex items-center gap-3 glass-panel px-4 py-2 rounded-full text-xs font-mono-custom cursor-default">
          <div className={`w-2 h-2 rounded-full ${syncDotColor(syncStatus)}`}></div>
          <span className="text-stone-300">Supabase: {syncLabel(syncStatus)}</span>
          <span className="text-stone-500">|</span>
          <span className="text-champagne">local</span>
        </div>
      </div>
    </header>
  );
}
