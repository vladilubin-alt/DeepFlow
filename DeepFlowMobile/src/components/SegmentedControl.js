import { View, Text, TouchableOpacity } from 'react-native';
import { colours } from '../theme/colours';

export default function SegmentedControl({ options, selectedIndex, onSelect }) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: colours.backgroundSurface, borderRadius: 8, padding: 2 }}>
      {options.map((opt, i) => {
        const active = i === selectedIndex;
        return (
          <TouchableOpacity
            key={i}
            onPress={() => onSelect(i)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 6,
              backgroundColor: active ? colours.backgroundRaised : 'transparent',
              alignItems: 'center',
            }}
          >
            <Text style={{
              fontSize: 12,
              color: active ? colours.accentGold : colours.textMuted,
              fontWeight: active ? '500' : '400',
            }}>
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
