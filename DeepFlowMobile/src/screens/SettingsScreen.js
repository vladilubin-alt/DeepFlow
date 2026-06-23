import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { supabase } from '../lib/supabase';

export default function SettingsScreen() {
  const { colours, mode, toggle } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) setUser(session.user);
      else setUser(null);
    });

    return () => listener?.subscription?.unsubscribe();
  }, []);

  const isAnonymous = user?.is_anonymous ?? user?.app_metadata?.provider === undefined;

  const handleSignIn = useCallback(async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.linkIdentity({
        provider: 'google',
        options: {
          redirectTo: 'deepflow://auth/callback',
        },
      });
      if (error) {
        if (error.message.includes('already linked')) {
          Alert.alert('Already Linked', 'This Google account is already linked to another user. Try a different account.');
        } else {
          Alert.alert('Sign In Failed', error.message);
        }
      }
    } catch (e) {
      Alert.alert('Sign In Failed', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colours.backgroundBase }}>
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={{ fontSize: 13, color: colours.textPrimary, fontWeight: '500', marginTop: 8, marginBottom: 16 }}>Settings</Text>

        <Section title="Account" colours={colours}>
          {user ? (
            <>
              <Row
                label="Signed in"
                value={isAnonymous ? 'Anonymous' : user.email || 'Connected'}
                colours={colours}
              />
              <Row label="User ID" value={user.id?.slice(0, 12) + '...'} colours={colours} />
              {isAnonymous && (
                <TouchableOpacity
                  onPress={handleSignIn}
                  disabled={loading}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                    paddingVertical: 14,
                    backgroundColor: colours.backgroundSurface,
                    borderBottomWidth: 0.5,
                    borderBottomColor: colours.borderSubtle,
                  }}
                >
                  <Text style={{ fontSize: 12, color: colours.accentGold, fontWeight: '500' }}>
                    {loading ? 'Signing in...' : 'Sign in with Google'}
                  </Text>
                </TouchableOpacity>
              )}
              {!isAnonymous && (
                <TouchableOpacity
                  onPress={handleSignOut}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                    paddingVertical: 14,
                    backgroundColor: colours.backgroundSurface,
                    borderBottomWidth: 0.5,
                    borderBottomColor: colours.borderSubtle,
                  }}
                >
                  <Text style={{ fontSize: 12, color: colours.stateDanger }}>Sign Out</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <Row label="Auth" value="Not initialized" colours={colours} />
          )}
        </Section>

        <Section title="App" colours={colours}>
          <Row label="Sensory audio" value="Off (coming soon)" colours={colours} />
          <Row label="Haptic feedback" value="On" colours={colours} />
          <Row label="Sound effects" value="On" colours={colours} />
        </Section>

        <Section title="Theme" colours={colours}>
          <Row
            label="Appearance"
            value={mode === 'dark' ? 'Dark' : 'Light'}
            colours={colours}
            onPress={toggle}
          />
        </Section>

        <Section title="Session" colours={colours}>
          <Row label="Idle threshold" value="5s" colours={colours} />
          <Row label="Guillotine fuse" value="10s" colours={colours} />
          <Row label="Danger border" value="Enabled" colours={colours} />
        </Section>

        <Section title="About" colours={colours}>
          <Row label="Version" value="0.1.0" colours={colours} />
          <Row label="Build" value="React Native" colours={colours} />
          <Row label="Data" value="Local-first + Supabase" colours={colours} />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children, colours }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 9, color: colours.textMuted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>{title}</Text>
      <View style={{ backgroundColor: colours.backgroundSurface, borderRadius: 8, overflow: 'hidden' }}>{children}</View>
    </View>
  );
}

function Row({ label, value, colours, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: colours.borderSubtle,
      }}
    >
      <Text style={{ fontSize: 12, color: colours.textPrimary }}>{label}</Text>
      <Text style={{ fontSize: 10, color: onPress ? colours.accentAmberDark : colours.textMuted }}>{value}</Text>
    </TouchableOpacity>
  );
}
