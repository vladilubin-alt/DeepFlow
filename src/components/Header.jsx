import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

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
  const navigate = useNavigate();
  const location = useLocation();
  const isHistory = location.pathname === '/history';

  const handleSignOut = async () => {
    // S-07: scope:'global' revokes the server-side refresh token so the
    // session is truly invalidated — not just cleared from local storage.
    await supabase.auth.signOut({ scope: 'global' });
    window.location.reload();
  };

  return (
    <header className="flex flex-row justify-between items-center gap-2 mb-1 sm:mb-6">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {isHistory ? (
          <div className="flex items-center gap-2 sm:block">
            <h1 className="text-lg sm:text-3xl md:text-4xl text-champagne font-serif italic tracking-wide shrink-0">DeepFlow</h1>
            <p className="hidden sm:block text-xs text-stone-400 font-sans mt-0.5 uppercase tracking-widest">ADHD Writing Instrument</p>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:block">
            <h1 className="text-lg sm:text-3xl md:text-4xl text-champagne font-serif italic tracking-wide shrink-0">DeepFlow</h1>
            <p className="hidden sm:block text-xs text-stone-400 font-sans mt-0.5 uppercase tracking-widest">ADHD Writing Instrument</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 sm:gap-3">
        {!isHistory && (
          <button
            onClick={() => navigate('/history')}
            className="magnetic-btn px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-mono-custom bg-deep-slate border border-slate-gray/60 text-stone-400 hover:text-champagne hover:border-champagne/40 transition"
            aria-label="View session history"
          >
            <span className="hidden sm:inline">History </span>◆
          </button>
        )}

        <button
          onClick={onOpenVault}
          className="magnetic-btn px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-mono-custom bg-deep-slate border border-slate-gray/60 text-stone-400 hover:text-champagne hover:border-champagne/40 transition"
          aria-label="Open writing vault"
        >
          <span className="hidden sm:inline">Vault </span>◆
        </button>

        <div className="magnetic-btn flex items-center gap-1 sm:gap-3 glass-panel px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-mono-custom cursor-default" aria-label={`Sync status: ${syncLabel(syncStatus)}`}>
          <div className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${syncDotColor(syncStatus)}`} aria-hidden="true"></div>
          <span className="hidden sm:inline text-stone-300">Supabase: {syncLabel(syncStatus)}</span>
          <span className="hidden sm:inline text-stone-500">|</span>
          <span className="hidden sm:inline text-champagne">local</span>
        </div>

        <button
          onClick={handleSignOut}
          className="magnetic-btn px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-mono-custom bg-deep-slate border border-slate-gray/60 text-stone-400 hover:text-red-400 hover:border-red-400/40 transition"
          aria-label="Sign out"
        >
          <span className="hidden sm:inline">Sign Out</span>
          <span className="sm:hidden">𝕏</span>
        </button>
      </div>
    </header>
  );
}
