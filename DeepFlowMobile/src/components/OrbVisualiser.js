import { View } from 'react-native';
import { colours } from '../theme/colours';

export default function OrbVisualiser({ state }) {
  const isWarning = state === 'warning' || state === 'guillotined';
  const isActive = state === 'writing' || state === 'saved_by_grace';
  const ringColour = isWarning ? colours.stateDanger : colours.accentGold;
  const dotColour = isWarning ? colours.stateDanger : isActive ? colours.accentGold : colours.accentGold;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 16 }}>
      <View style={{
        width: 40, height: 40, borderRadius: 20,
        borderWidth: 2, borderColor: ringColour,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dotColour }} />
      </View>
    </View>
  );
}
