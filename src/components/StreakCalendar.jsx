import React from 'react';

export default function StreakCalendar({ streak }) {
  const today = new Date();
  const days = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d);
  }

  const dayLabel = (d) => d.toLocaleDateString('en', { weekday: 'narrow' });
  const isActive = (d) => {
    const key = d.toISOString().split('T')[0];
    return false;
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-1.5">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(l => (
          <div key={l} className="text-center text-xxs text-slate-heading font-mono-custom uppercase">
            {l}
          </div>
        ))}
        {days.map((d, i) => {
          const firstOfMonth = d.getDate() === 1;
          return (
            <div
              key={i}
              className={`aspect-square rounded-md flex items-center justify-center text-xxs font-mono-custom
                ${i < today.getDate() - 1
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
