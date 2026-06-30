import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function GraceTokenButton({ count, onUse }) {
  const { colours } = useTheme();
  if (!count || count <= 0) return null;
  return (
    <TouchableOpacity
      onPress={onUse}
      accessibilityLabel={`Use a grace token. ${count} remaining`}
      accessibilityRole="button"
      accessibilityHint="Rescues your draft from the guillotine"
      style={{
        backgroundColor: '#0D0D12',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginVertical: 4,
        borderWidth: 0.5,
        borderColor: '#C9A84C40',
      }}
    >
      <Text style={{ fontSize: 11, color: '#C9A84C', fontFamily: 'monospace', letterSpacing: 0.5 }}>
        [ USE GRACE TOKEN — {count} LEFT ]
      </Text>
    </TouchableOpacity>
  );
}
