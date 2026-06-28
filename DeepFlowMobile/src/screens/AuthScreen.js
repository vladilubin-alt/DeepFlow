import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export default function AuthScreen({ colours }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleEmailAuth = useCallback(async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const { error } = isSignUp
        ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: 'https://gleeful-liger-6f788b.netlify.app/auth/confirm' } })
        : await supabase.auth.signInWithPassword({ email, password });
      if (error) Alert.alert('Auth Error', error.message);
    } catch (e) {
      Alert.alert('Auth Error', e.message);
    } finally {
      setLoading(false);
    }
  }, [email, password, isSignUp]);

  const handleGoogleSignIn = useCallback(async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'deepflow://auth/callback' },
      });
      if (error) Alert.alert('Google Sign-In Error', error.message);
    } catch (e) {
      Alert.alert('Google Sign-In Error', e.message);
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
        />

        <TouchableOpacity
          onPress={handleEmailAuth}
          disabled={loading}
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
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleGoogleSignIn}
          disabled={loading}
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
          style={{ marginTop: 16, alignItems: 'center' }}
        >
          <Text style={{ fontSize: 12, color: colours.textMuted }}>
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
