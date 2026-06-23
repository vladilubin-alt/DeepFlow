import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { supabase } from '../lib/supabase';
import { useGraveyard } from '../hooks/useGraveyard';
import { triggerGraceTokenPaywall } from '../services/SuperwallService';
import { track } from '../services/AnalyticsService';

function timeAgo(date) {
  const hours = Math.floor((Date.now() - date.getTime()) / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function VaultScreen() {
  const { colours } = useTheme();
  const { entries, loading, error, graceTokens, setGraceTokens, fetchEntries } = useGraveyard();
  const [recovering, setRecovering] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  function costInfo(hoursAgo) {
    if (hoursAgo < 1) return { badge: '50 tokens', colour: colours.stateSuccess, label: 'paid' };
    if (hoursAgo < 168) return { badge: '$0.99', colour: colours.accentGold, label: 'paid' };
    if (hoursAgo < 720) return { badge: '$1.99', colour: colours.stateDangerMuted, label: 'paid' };
    return { badge: 'gone', colour: '#2a2510', label: 'expired' };
  }

  const handleRecover = async (item) => {
    if (recovering) return;
    const hoursAgo = item.deleted_at
      ? (Date.now() - new Date(item.deleted_at).getTime()) / 3600000
      : 0;
    const cost = costInfo(hoursAgo);
    if (cost.label === 'expired') return;

    setRecovering(item.id);
    try {
      if (graceTokens > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').update({ grace_tokens: graceTokens - 1 }).eq('id', user.id);
        }
        setGraceTokens((t) => t - 1);
        track('Vault Recovered', { wordCount: item.word_count, method: 'grace_token' });
      } else {
        triggerGraceTokenPaywall(async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('grace_tokens')
              .eq('id', user.id)
              .single();
            const newTokens = (profile?.grace_tokens ?? 0) + 3;
            await supabase.from('profiles').update({ grace_tokens: newTokens }).eq('id', user.id);
            setGraceTokens(newTokens);
          }
          track('Vault Recovered', { wordCount: item.word_count, method: 'paywall' });
        });
      }
    } finally {
      setRecovering(null);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colours.backgroundBase }}>
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={{ fontSize: 13, color: colours.textPrimary, fontWeight: '500', marginTop: 8, marginBottom: 2 }}>Vault</Text>
        <Text style={{ fontSize: 9, color: colours.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
          Failed drafts · tap to recover
        </Text>

        {loading && (
          <Text style={{ fontSize: 11, color: colours.textMuted, textAlign: 'center', marginVertical: 20 }}>
            Loading vault...
          </Text>
        )}

        {error && (
          <Text style={{ fontSize: 11, color: colours.stateDanger, textAlign: 'center', marginVertical: 20 }}>
            {error}
          </Text>
        )}

        {!loading && !error && entries.length === 0 && (
          <Text style={{ fontSize: 11, color: colours.textMuted, textAlign: 'center', marginVertical: 20 }}>
            No drafts in the vault yet.
          </Text>
        )}

        {!loading && entries.map((item) => {
          const hoursAgo = item.deleted_at
            ? (Date.now() - new Date(item.deleted_at).getTime()) / 3600000
            : Infinity;
          const cost = costInfo(hoursAgo);
          const dotColour = recovering === item.id ? colours.accentGold : cost.colour;

          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleRecover(item)}
              disabled={recovering === item.id || cost.label === 'expired'}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colours.backgroundSurface,
                borderRadius: 8,
                padding: 12,
                marginBottom: 6,
                opacity: cost.label === 'expired' ? 0.4 : 1,
              }}
            >
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: dotColour, marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: colours.textPrimary, numberOfLines: 1 }}>
                  {(item.content || '').slice(0, 60) || 'Untitled draft'}
                </Text>
                <Text style={{ fontSize: 9, color: colours.textMuted, marginTop: 2 }}>
                  failed {timeAgo(new Date(item.deleted_at))} · {item.word_count} words
                </Text>
              </View>
              <View style={{
                backgroundColor: cost.colour + '20',
                borderRadius: 4,
                paddingHorizontal: 8,
                paddingVertical: 3,
              }}>
                <Text style={{ fontSize: 10, color: cost.label === 'expired' ? colours.textMuted : cost.colour }}>
                  {recovering === item.id ? '...' : cost.badge}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <Text style={{ fontSize: 9, color: colours.textMuted, textAlign: 'center', marginTop: 16 }}>
          {graceTokens} grace tokens remaining
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
