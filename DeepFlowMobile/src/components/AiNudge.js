import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function AiNudge({ prompt, onDismiss }) {
  const { colours } = useTheme();
  if (!prompt) return null;
  return (
    <TouchableOpacity onPress={onDismiss} accessibilityLabel={`AI coaching tip: ${prompt}. Double tap to dismiss`} accessibilityRole="alert" style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#1a1506',
      borderWidth: 0.5,
      borderColor: '#3a2e08',
      borderRadius: 6,
      padding: 10,
      marginVertical: 4,
    }}>
      <Text style={{ fontSize: 12, marginRight: 8 }}>✨</Text>
      <Text style={{ fontSize: 10, color: colours.textPrimary, flex: 1 }}>{prompt}</Text>
    </TouchableOpacity>
  );
}
