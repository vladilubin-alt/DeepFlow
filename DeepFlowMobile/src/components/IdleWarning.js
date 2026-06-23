import { View, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function IdleWarning({ idleMs, thresholdMs }) {
  const { colours } = useTheme();
  if (idleMs == null || idleMs <= 0) return null;
  const remaining = Math.max(0, Math.ceil((thresholdMs - idleMs) / 1000));
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 2 }}>
      <Text style={{ fontSize: 10, color: colours.stateDanger }}>Idle warning in {remaining}s</Text>
      <Text style={{ fontSize: 10, color: colours.accentGold, fontFamily: 'monospace' }}>{remaining}s</Text>
    </View>
  );
}
