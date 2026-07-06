import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Linking, Modal } from 'react-native';
import { setAnalyticsConsent, getAnalyticsConsent } from '../services/ConsentService';
import { useTheme } from '../theme/ThemeContext';
import { resetConsentCache } from '../services/AnalyticsService';

export default function CookieConsent({ onConsent }) {
  const [visible, setVisible] = useState(false);
  const { colours } = useTheme();

  useEffect(() => {
    getAnalyticsConsent().then((val) => {
      if (!val) setVisible(true);
    });
  }, []);

  const handleAccept = () => {
    setAnalyticsConsent('accepted');
    setVisible(false);
    resetConsentCache();
    if (onConsent) onConsent('accepted');
  };

  const handleReject = () => {
    setAnalyticsConsent('rejected');
    setVisible(false);
    resetConsentCache();
    if (onConsent) onConsent('rejected');
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={handleReject}>
      <View style={{
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}>
        <View style={{
          backgroundColor: '#16161F',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          padding: 24,
          paddingBottom: 40,
          borderTopWidth: 1,
          borderTopColor: '#2A2A35',
        }}>
          <Text style={{
            fontSize: 13,
            color: '#aaa',
            marginBottom: 16,
            lineHeight: 20,
          }}>
            We use analytics to understand how you use DeepFlow. No writing content is ever tracked.
            By continuing, you agree to our{' '}
            <Text
              style={{ color: '#EF9F27' }}
              onPress={() => Linking.openURL('https://gleeful-liger-6f788b.netlify.app/privacy')}
            >
              Privacy Policy
            </Text>.
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={handleAccept}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: '#EF9F27',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#1a1a1a' }}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleReject}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#333',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 13, color: '#888' }}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
