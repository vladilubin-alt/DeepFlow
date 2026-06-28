import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AuthScreen({ onAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + '/auth/confirm' } });
        if (error) {
          setMessage({ type: 'error', text: error.message });
        } else {
          setMessage({ type: 'success', text: 'Check your email for a confirmation link.' });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setMessage({ type: 'error', text: error.message });
        } else if (data.session) {
          onAuth(data.session);
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 380, padding: '40px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ color: '#EF9F27', fontSize: 32, fontWeight: 700, marginBottom: 4 }}>DeepFlow</h1>
          <p style={{ color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2 }}>ADHD Writing Instrument</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            style={{
              width: '100%', padding: '14px 16px', fontSize: 14, borderRadius: 8,
              border: '1px solid #333', backgroundColor: '#1a1a1a', color: '#fff',
              marginBottom: 12, outline: 'none', boxSizing: 'border-box',
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            style={{
              width: '100%', padding: '14px 16px', fontSize: 14, borderRadius: 8,
              border: '1px solid #333', backgroundColor: '#1a1a1a', color: '#fff',
              marginBottom: 16, outline: 'none', boxSizing: 'border-box',
            }}
          />

          {message && (
            <div style={{
              padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: 13,
              backgroundColor: message.type === 'error' ? '#2a1515' : '#152a15',
              color: message.type === 'error' ? '#E24B4A' : '#4ade80',
              border: `1px solid ${message.type === 'error' ? '#E24B4A33' : '#4ade8033'}`,
            }}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px', fontSize: 14, fontWeight: 600, borderRadius: 8,
              border: 'none', cursor: 'pointer', marginBottom: 12,
              backgroundColor: '#EF9F27', color: '#1a1a1a',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? '...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: '100%', padding: '14px', fontSize: 13, borderRadius: 8,
            border: '1px solid #333', backgroundColor: 'transparent', color: '#fff',
            cursor: 'pointer', marginBottom: 16,
          }}
        >
          Continue with Google
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#666' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setMessage(null); }}
            style={{ background: 'none', border: 'none', color: '#EF9F27', cursor: 'pointer', fontSize: 12, padding: 0 }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}
