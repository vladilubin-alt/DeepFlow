import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function GraceTokenButton({ count, onUse }) {
  const { colours } = useTheme();
  if (!count || count <= 0) return null;
  return (
    <TouchableOpacity
      onPress={onUse}
      style={{
        backgroundColor: '#1a0a0a',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginVertical: 4,
      }}
    >
      <Text style={{ fontSize: 12, color: colours.stateDangerMuted }}>
        use grace token ({count} left)
      </Text>
    </TouchableOpacity>
  );
}
