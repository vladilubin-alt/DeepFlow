import { View, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function TopBar({ labelRight, dotColour, subtitle, isConnected, pendingSync }) {
  const { colours } = useTheme();
  const dotColor = isConnected === false ? colours.stateDanger : (dotColour || colours.stateSuccess);
  const label = labelRight || (isConnected === false ? 'Offline' : 'Connected');
  const syncInfo = pendingSync > 0 ? ` · ${pendingSync} pending` : '';

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, paddingBottom: 4 }}>
      <View>
        <Text style={{ fontSize: 20, fontStyle: 'italic', color: colours.accentGold, fontWeight: '400', letterSpacing: 0.5 }}>
          DeepFlow
        </Text>
        <Text style={{ fontSize: 9, color: colours.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 1 }}>
          {subtitle || 'ADHD WRITING INSTRUMENT'}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: dotColor }} />
        <Text style={{ fontSize: 10, color: colours.textMuted }}>{label}{syncInfo}</Text>
      </View>
    </View>
  );
}
