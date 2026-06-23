import { View, Text, TextInput } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function WritingArea({ text, onTextChange, editable, fadingText, state }) {
  const { colours } = useTheme();
  const isDanger = state === 'guillotined' || state === 'warning';
  const bgColour = isDanger ? colours.backgroundDanger : colours.backgroundSurface;

  return (
    <View style={{
      backgroundColor: bgColour,
      borderRadius: 8,
      minHeight: '30%',
      padding: 14,
      marginVertical: 8,
    }}>
      {fadingText ? (
        <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#2a2510', position: 'absolute', top: 14, left: 14, right: 14 }}>
          {fadingText}
        </Text>
      ) : null}
      <TextInput
        style={{ fontSize: 12, fontFamily: 'monospace', color: colours.textPrimary, lineHeight: 18, height: '100%' }}
        value={text}
        onChangeText={onTextChange}
        editable={editable !== false}
        multiline
        textAlignVertical="top"
        placeholder="Start writing..."
        placeholderTextColor={colours.textDisabled}
      />
    </View>
  );
}
