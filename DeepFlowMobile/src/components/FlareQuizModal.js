import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { FLARES, completeOnboarding } from '../services/FlareQuizService';

export const FLARE_DEFAULTS = {
  time_warp: { duration: 45, wordTarget: 500, aiMode: 'silent' },
  task_freeze: { duration: 5, wordTarget: 50, aiMode: 'coach' },
  hyperfocus: { duration: 30, wordTarget: 500, aiMode: 'silent' },
  decision_fog: { duration: 5, wordTarget: 25, aiMode: 'coach' },
  crash_guilt: { duration: 3, wordTarget: 25, aiMode: 'demon' },
  phantom_writer: { duration: 10, wordTarget: 100, aiMode: 'coach' },
  overthinker: { duration: 5, wordTarget: 50, aiMode: 'demon' },
  chaos_crafter: { duration: 25, wordTarget: 300, aiMode: 'silent' },
  deep_diver: { duration: 60, wordTarget: 750, aiMode: 'silent' },
  deadline_demon: { duration: 3, wordTarget: 25, aiMode: 'demon' },
};

export default function FlareQuizModal({ visible, onComplete }) {
  const { colours } = useTheme();
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);

  const handleSelect = async (flare) => {
    setSelected(flare);
    await completeOnboarding(flare.id);
    onComplete(flare.id);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
      }}>
        <View style={{ width: '100%', maxWidth: 400 }}>
          <Text style={{
            fontSize: 28,
            color: colours.accentGold,
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: 4,
            fontStyle: 'italic',
          }}>
            DeepFlow
          </Text>
          <Text style={{
            fontSize: 10,
            color: colours.textMuted,
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: 2.5,
            marginBottom: 32,
          }}>
            ADHD Writing Instrument
          </Text>

          {step === 1 && (
            <>
              <Text style={{
                fontSize: 14,
                color: colours.textPrimary,
                textAlign: 'center',
                marginBottom: 24,
                lineHeight: 20,
              }}>
                Which feels most like you when you sit down to write?
              </Text>
              <ScrollView style={{ maxHeight: 400 }}>
                {FLARES.map((flare) => (
                  <TouchableOpacity
                    key={flare.id}
                    onPress={() => { setSelected(flare); setStep(2); }}
                    style={{
                      backgroundColor: colours.backgroundSurface,
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 8,
                      borderWidth: 0.5,
                      borderColor: colours.borderSubtle,
                    }}
                  >
                    <Text style={{ fontSize: 16, marginBottom: 4 }}>
                      {flare.emoji} {flare.label}
                    </Text>
                    <Text style={{ fontSize: 12, color: colours.textMuted, lineHeight: 18 }}>
                      {flare.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {step === 2 && selected && (
            <>
              <Text style={{
                fontSize: 16,
                color: colours.textPrimary,
                textAlign: 'center',
                marginBottom: 8,
              }}>
                {selected.emoji} {selected.label}
              </Text>
              <Text style={{
                fontSize: 12,
                color: colours.textMuted,
                textAlign: 'center',
                marginBottom: 32,
                lineHeight: 18,
              }}>
                {selected.description}
              </Text>

              <TouchableOpacity
                onPress={() => handleSelect(selected)}
                style={{
                  backgroundColor: colours.accentGold,
                  borderRadius: 8,
                  height: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}
              >
                <Text style={{ fontSize: 14, color: colours.accentGoldText, fontWeight: '500' }}>
                  Let's Go
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setStep(1)}
                style={{ alignItems: 'center', paddingVertical: 8 }}
              >
                <Text style={{ fontSize: 12, color: colours.textMuted }}>
                  ← Back
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
