import { View, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function StatStrip({ streak, graceTokens }) {
  const { colours } = useTheme();
  const Card = ({ label, value, suffix }) => (
    <View style={{ flex: 1, backgroundColor: colours.backgroundSurface, borderRadius: 8, padding: 14, marginHorizontal: 3 }}>
      <Text style={{ fontSize: 9, color: colours.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{label}</Text>
      <Text style={{ fontSize: 24, color: colours.accentGold, fontWeight: '500' }}>
        {value}<Text style={{ fontSize: 12, color: colours.textMuted }}> {suffix}</Text>
      </Text>
    </View>
  );

  return (
    <View style={{ flexDirection: 'row', gap: 6, marginBottom: 16 }}>
      <Card label="streak" value={streak ?? 0} suffix="days" />
      <Card label="grace tokens" value={graceTokens ?? 3} suffix="left" />
    </View>
  );
}
