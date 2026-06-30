import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from '../lib/supabase';
import { GOOGLE_WEB_CLIENT_ID } from '../config/env';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  offlineAccess: false,
});

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30000;

function sanitizeAuthError(error) {
  const msg = (error?.message || '').toLowerCase();
  if (msg.includes('invalid login credentials') || msg.includes('invalid email or password')) {
    return 'Invalid email or password.';
  }
  if (msg.includes('user already registered')) return 'An account with this email already exists.';
  if (msg.includes('email not confirmed')) return 'Please check your email to confirm your account.';
  if (msg.includes('rate limit') || msg.includes('too many')) return 'Too many attempts. Please try again later.';
  if (msg.includes('password should be at least')) return 'Password must be at least 6 characters.';
  return 'Something went wrong. Please try again.';
}

export default function AuthScreen({ colours }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const attemptsRef = useRef(0);
  const lockoutUntilRef = useRef(0);

  const handleEmailAuth = useCallback(async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    if (Date.now() < lockoutUntilRef.current) {
      const secs = Math.ceil((lockoutUntilRef.current - Date.now()) / 1000);
      Alert.alert('Too many attempts', `Please wait ${secs} seconds before trying again.`);
      return;
    }
    setLoading(true);
    try {
      const { error } = isSignUp
        ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: 'https://gleeful-liger-6f788b.netlify.app/auth/confirm' } })
        : await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        attemptsRef.current++;
        if (attemptsRef.current >= MAX_ATTEMPTS) {
          lockoutUntilRef.current = Date.now() + LOCKOUT_MS;
          attemptsRef.current = 0;
        }
        Alert.alert('Auth Error', sanitizeAuthError(error));
      } else {
        attemptsRef.current = 0;
      }
    } catch (e) {
      Alert.alert('Auth Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, password, isSignUp]);

  const handleGoogleSignIn = useCallback(async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const { data } = await GoogleSignin.signIn();
      const { idToken } = data;
      if (!idToken) throw new Error('No ID token returned');

      const { data: authData, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });
      if (error) throw error;
    } catch (error) {
      Alert.alert('Google Sign-In Error', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colours.backgroundBase }}>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 32 }}>
        <Text style={{ fontSize: 28, color: colours.accentGold, fontWeight: '600', textAlign: 'center', marginBottom: 4 }}>
          DeepFlow
        </Text>
        <Text style={{ fontSize: 11, color: colours.textMuted, textAlign: 'center', marginBottom: 32, textTransform: 'uppercase', letterSpacing: 1.5 }}>
          ADHD Writing Instrument
        </Text>

        <TextInput
          style={{
            backgroundColor: colours.backgroundSurface,
            borderRadius: 8,
            padding: 14,
            fontSize: 14,
            color: colours.textPrimary,
            marginBottom: 12,
          }}
          placeholder="Email"
          placeholderTextColor={colours.textDisabled}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          accessibilityLabel="Email address"
          accessibilityHint="Enter your email to sign in or create an account"
        />

        <TextInput
          style={{
            backgroundColor: colours.backgroundSurface,
            borderRadius: 8,
            padding: 14,
            fontSize: 14,
            color: colours.textPrimary,
            marginBottom: 16,
          }}
          placeholder="Password"
          placeholderTextColor={colours.textDisabled}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          accessibilityLabel="Password"
          accessibilityHint="Enter your password"
        />

        <TouchableOpacity
          onPress={handleEmailAuth}
          disabled={loading}
          accessibilityLabel={isSignUp ? 'Create Account' : 'Sign In'}
          accessibilityRole="button"
          style={{
            backgroundColor: colours.accentGold,
            borderRadius: 8,
            height: 48,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}
        >
          {loading ? (
            <ActivityIndicator color={colours.accentGoldText} />
          ) : (
            <Text style={{ fontSize: 14, color: colours.accentGoldText, fontWeight: '500' }}>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => { console.log('[Google] Button tapped!'); handleGoogleSignIn(); }}
          disabled={loading}
          accessibilityLabel="Continue with Google"
          accessibilityRole="button"
          style={{
            backgroundColor: colours.backgroundSurface,
            borderRadius: 8,
            height: 48,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 0.5,
            borderColor: colours.borderSubtle,
          }}
        >
          <Text style={{ fontSize: 13, color: colours.textPrimary }}>
            Continue with Google
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsSignUp(!isSignUp)}
          accessibilityLabel={isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create Account"}
          accessibilityRole="button"
          style={{ marginTop: 16, alignItems: 'center' }}
        >
          <Text style={{ fontSize: 12, color: colours.textMuted }}>
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create Account"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
