import React from 'react';

const FREQUENCIES = ['alpha', 'beta', 'off'];

export default function SensoryLayer({ frequency, onFrequencyChange, isMuted, onMuteToggle }) {
  return (
    <div className="glass-panel rounded-[2rem] p-6 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-sans font-bold uppercase tracking-[0.15em] text-slate-heading">Sensory Layer</h2>

        <button
          onClick={onMuteToggle}
          className="magnetic-btn text-xs font-sans font-bold uppercase tracking-[0.15em] text-slate-heading hover:text-stone-300 transition"
        >
          {isMuted ? 'Muted' : 'Audio'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {FREQUENCIES.map((mode) => (
          <button
            key={mode}
            onClick={() => onFrequencyChange(mode)}
            disabled={isMuted && mode !== 'off'}
            className={`magnetic-btn py-2.5 rounded-xl border text-xs font-mono-custom uppercase tracking-wider transition disabled:opacity-30
              ${frequency === mode
                ? 'bg-champagne/10 border-champagne text-champagne'
                : 'bg-obsidian/60 border-slate-gray/80 text-stone-500 hover:text-stone-300'}`}
          >
            {mode}
          </button>
        ))}
      </div>

      <p className="text-xxs text-stone-500 font-mono-custom leading-relaxed mt-1">
        {frequency !== 'off' && !isMuted
          ? `Synthesizing ${frequency} waves in stereo using the Web Audio API.`
          : 'Audio synthesis is disabled. Toggle unmuted and select a frequency.'}
      </p>
    </div>
  );
}
