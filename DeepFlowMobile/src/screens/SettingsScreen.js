import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { useHaptic } from '../theme/HapticContext';
import { supabase } from '../lib/supabase';
import { getReminderSettings, setReminderEnabled, setReminderTime } from '../services/NotificationService';
import { exportUserData, deleteAccount } from '../services/GdprService';

const HAPTIC_KEY = '@deepflow/settings/haptic';
const SOUND_KEY = '@deepflow/settings/sound';

export default function SettingsScreen() {
  const { colours, mode, toggle } = useTheme();
  const { enabled: hapticOn, toggleHaptic } = useHaptic();
  const [user, setUser] = useState(null);
  const [soundOn, setSoundOn] = useState(true);
  const [reminderOn, setReminderOn] = useState(false);
  const [reminderHour, setReminderHour] = useState(9);
  const [reminderMinute, setReminderMinute] = useState(0);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SOUND_KEY).then(v => { if (v !== null) setSoundOn(v === 'true'); });
    getReminderSettings().then(s => {
      setReminderOn(s.enabled);
      setReminderHour(s.hour);
      setReminderMinute(s.minute);
    });
  }, []);

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

  const handleSignOut = useCallback(async () => {
    // S-07: scope:'global' revokes the server-side refresh token
    await supabase.auth.signOut({ scope: 'global' });
  }, []);

  const toggleSound = useCallback(async () => {
    const next = !soundOn;
    setSoundOn(next);
    await AsyncStorage.setItem(SOUND_KEY, String(next));
  }, [soundOn]);

  const toggleReminder = useCallback(async () => {
    const next = !reminderOn;
    setReminderOn(next);
    await setReminderEnabled(next);
  }, [reminderOn]);

  const formatTime = (h, m) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const adjustReminderTime = useCallback(async (deltaH, deltaM) => {
    let newH = (reminderHour + deltaH + 24) % 24;
    let newM = (reminderMinute + deltaM + 60) % 60;
    setReminderHour(newH);
    setReminderMinute(newM);
    await setReminderTime(newH, newM);
  }, [reminderHour, reminderMinute]);

  const handleExportData = useCallback(async () => {
    setExporting(true);
    try {
      await exportUserData();
    } catch (e) {
      Alert.alert('Export Failed', e.message || 'Could not export data.');
    } finally {
      setExporting(false);
    }
  }, []);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete all your data including writing sessions, drafts, and graveyard entries. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteAccount();
            } catch (e) {
              Alert.alert('Deletion Failed', e.message || 'Could not delete account.');
              setDeleting(false);
            }
          },
        },
      ],
    );
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
                value={user.email || 'Connected'}
                colours={colours}
              />
              <Row label="User ID" value={user.id?.slice(0, 12) + '...'} colours={colours} />
              <TouchableOpacity
                onPress={handleSignOut}
                accessibilityLabel="Sign out of your account"
                accessibilityRole="button"
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
            </>
          ) : (
            <Row label="Auth" value="Not signed in" colours={colours} />
          )}
        </Section>

        <Section title="Privacy" colours={colours}>
          <TouchableOpacity
            onPress={() => Linking.openURL(PRIVACY_URL)}
            accessibilityLabel="Open Privacy Policy"
            accessibilityRole="link"
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
            <Text style={{ fontSize: 12, color: colours.textPrimary }}>Privacy Policy</Text>
            <Text style={{ fontSize: 10, color: colours.accentAmberDark }}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleExportData}
            disabled={exporting}
            accessibilityLabel="Export your data"
            accessibilityRole="button"
            accessibilityState={{ disabled: exporting }}
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
            <Text style={{ fontSize: 12, color: colours.textPrimary }}>Export my data</Text>
            {exporting ? (
              <ActivityIndicator size="small" color={colours.accentGold} />
            ) : (
              <Text style={{ fontSize: 10, color: colours.accentAmberDark }}>Export</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDeleteAccount}
            disabled={deleting}
            accessibilityLabel="Delete your account permanently"
            accessibilityRole="button"
            accessibilityHint="Opens a confirmation dialog"
            accessibilityState={{ disabled: deleting }}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 14,
              paddingVertical: 12,
            }}
          >
            <Text style={{ fontSize: 12, color: colours.stateDanger }}>Delete account</Text>
            {deleting ? (
              <ActivityIndicator size="small" color={colours.stateDanger} />
            ) : (
              <Text style={{ fontSize: 10, color: colours.stateDanger }}>Delete</Text>
            )}
          </TouchableOpacity>
        </Section>

        <Section title="App" colours={colours}>
          <Row
            label="Haptic feedback"
            value={hapticOn ? 'On' : 'Off'}
            colours={colours}
            onPress={toggleHaptic}
          />
          <Row
            label="Sound effects"
            value={soundOn ? 'On' : 'Off'}
            colours={colours}
            onPress={toggleSound}
          />
          <Row
            label="Daily reminder"
            value={reminderOn ? formatTime(reminderHour, reminderMinute) : 'Off'}
            colours={colours}
            onPress={toggleReminder}
          />
          {reminderOn && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: colours.borderSubtle }}>
              <TouchableOpacity onPress={() => adjustReminderTime(-1, 0)} accessibilityLabel="Decrease reminder hour" accessibilityRole="button" style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
                <Text style={{ fontSize: 16, color: colours.accentGold }}>◀</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 20, color: colours.textPrimary, fontWeight: '500', marginHorizontal: 12, minWidth: 80, textAlign: 'center' }}>
                {formatTime(reminderHour, reminderMinute)}
              </Text>
              <TouchableOpacity onPress={() => adjustReminderTime(1, 0)} accessibilityLabel="Increase reminder hour" accessibilityRole="button" style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
                <Text style={{ fontSize: 16, color: colours.accentGold }}>▶</Text>
              </TouchableOpacity>
              <View style={{ width: 12 }} />
              <TouchableOpacity onPress={() => adjustReminderTime(0, -15)} accessibilityLabel="Decrease reminder by 15 minutes" accessibilityRole="button" style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
                <Text style={{ fontSize: 14, color: colours.textMuted }}>-15m</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => adjustReminderTime(0, 15)} accessibilityLabel="Increase reminder by 15 minutes" accessibilityRole="button" style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
                <Text style={{ fontSize: 14, color: colours.textMuted }}>+15m</Text>
              </TouchableOpacity>
            </View>
          )}
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
          <Row label="Version" value="0.3.0" colours={colours} />
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
      accessibilityLabel={`${label}: ${value}`}
      accessibilityRole="button"
      accessibilityState={{ disabled: !onPress }}
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
