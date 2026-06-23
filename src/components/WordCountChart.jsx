import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function WordCountChart({ sessions }) {
  const data = [...sessions]
    .reverse()
    .map(s => ({
      date: s.started_at ? s.started_at.split('T')[0] : '',
      words: s.words_written || 0,
    }));

  if (data.length === 0) {
    return (
      <div className="text-stone-500 text-sm font-mono-custom text-center py-12">
        No session data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="wordGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C9A84C" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#C9A84C" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tick={{ fill: '#5C5C6E', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#5C5C6E', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: '#16161F',
            border: '1px solid #2A2A35',
            borderRadius: '12px',
            fontSize: '12px',
            fontFamily: 'JetBrains Mono',
          }}
          labelStyle={{ color: '#FAF8F5' }}
          itemStyle={{ color: '#C9A84C' }}
        />
        <Area
          type="monotone"
          dataKey="words"
          stroke="#C9A84C"
          strokeWidth={2}
          fill="url(#wordGrad)"
          dot={false}
          activeDot={{ r: 4, fill: '#C9A84C' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
