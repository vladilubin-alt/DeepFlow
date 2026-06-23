import { View, Text, TouchableOpacity } from 'react-native';
import { colours } from '../theme/colours';

export default function TopBar({ labelRight, dotColour, subtitle }) {
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
        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: dotColour || colours.stateSuccess }} />
        <Text style={{ fontSize: 10, color: colours.textMuted }}>{labelRight || 'Connected'}</Text>
      </View>
    </View>
  );
}
