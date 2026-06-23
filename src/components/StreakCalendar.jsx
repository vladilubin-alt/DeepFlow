import React from 'react';

export default function StreakCalendar({ streak, sessions }) {
  const today = new Date();
  const days = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d);
  }

  const activeDates = new Set(
    (sessions || [])
      .filter(s => s.status === 'completed' || s.status === 'saved_by_grace')
      .map(s => s.started_at?.split('T')[0])
      .filter(Boolean),
  );

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-1.5">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(l => (
          <div key={l} className="text-center text-xxs text-slate-heading font-mono-custom uppercase">
            {l}
          </div>
        ))}
        {days.map((d, i) => {
          const key = d.toISOString().split('T')[0];
          const hasSession = activeDates.has(key);
          const isToday = key === today.toISOString().split('T')[0];
          const firstOfMonth = d.getDate() === 1;
          return (
            <div
              key={i}
              className={`aspect-square rounded-md flex items-center justify-center text-xxs font-mono-custom transition-colors
                ${hasSession
                  ? 'bg-champagne text-deep-slate font-bold'
                  : isToday
                    ? 'bg-champagne/15 text-champagne'
                    : 'bg-deep-slate text-stone-600'
                }
                ${firstOfMonth ? 'ring-1 ring-champagne/30' : ''}
              `}
            >
              {d.getDate()}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between text-xs font-mono-custom">
        <span className="text-stone-500">Current streak</span>
        <span className="text-champagne font-bold">{streak} days</span>
      </div>
    </div>
  );
}
