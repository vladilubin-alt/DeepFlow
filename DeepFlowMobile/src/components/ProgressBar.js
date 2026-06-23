import { View, Text } from 'react-native';
import { colours } from '../theme/colours';

export default function ProgressBar({ fraction, height }) {
  const fillWidth = Math.min(Math.max(fraction || 0, 0), 1);
  return (
    <View style={{ width: '100%', height: height || 3, backgroundColor: colours.backgroundRaised, borderRadius: 2, overflow: 'hidden' }}>
      <View style={{ width: `${fillWidth * 100}%`, height: '100%', backgroundColor: colours.accentGold, borderRadius: 2 }} />
    </View>
  );
}
