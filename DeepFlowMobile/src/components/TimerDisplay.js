import { View, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import ProgressBar from './ProgressBar';

export default function TimerDisplay({ remainingMs, wordsWritten, targetWords }) {
  const { colours } = useTheme();
  const totalSec = Math.max(0, Math.floor(remainingMs / 1000));
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  const timerStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const wpm = 0; // placeholder — would need session elapsed time
  const wpmFraction = Math.min(wpm / 60, 1);

  return (
    <View style={{ alignItems: 'center', marginVertical: 12 }}>
      <Text style={{ fontSize: 28, fontFamily: 'monospace', color: colours.accentGold, letterSpacing: 2 }}>
        {timerStr}
      </Text>
      <View style={{ width: '100%', marginTop: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ fontSize: 10, color: colours.textMuted, textTransform: 'uppercase' }}>wpm</Text>
          <Text style={{ fontSize: 10, color: colours.accentGold, fontFamily: 'monospace' }}>{wpm}</Text>
        </View>
        <ProgressBar fraction={wpmFraction} height={3} />
      </View>
      <View style={{ width: '100%', marginTop: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ fontSize: 10, color: colours.textMuted, textTransform: 'uppercase' }}>words</Text>
          <Text style={{ fontSize: 10, color: colours.accentGold, fontFamily: 'monospace' }}>{wordsWritten} / {targetWords}</Text>
        </View>
        <ProgressBar fraction={targetWords > 0 ? Math.min(wordsWritten / targetWords, 1) : 0} height={3} />
      </View>
    </View>
  );
}
