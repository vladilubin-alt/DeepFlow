import React, { Suspense, lazy } from 'react';

const RechartsChart = lazy(() => import('./WordCountChartInner.jsx'));

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
    <Suspense fallback={<div className="text-stone-500 text-sm font-mono-custom text-center py-12">Loading chart...</div>}>
      <RechartsChart data={data} />
    </Suspense>
  );
}
