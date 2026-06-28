import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AuthScreen({ onAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage({ type: 'error', text: 'Please enter email and password.' });
      return;
    }
    if (isSignUp && password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + '/auth/confirm' },
        });
        if (error) {
          setMessage({ type: 'error', text: error.message });
        } else {
          setMessage({ type: 'success', text: 'Check your email for a confirmation link.' });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes('Invalid login')) {
            setMessage({ type: 'error', text: 'Invalid email or password.' });
          } else {
            setMessage({ type: 'error', text: error.message });
          }
        } else if (data.session) {
          onAuth(data.session);
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
    } catch (err) {
      setMessage({ type: 'error', text: 'Google sign-in failed.' });
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Enter your email first.' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth/confirm',
      });
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setResetSent(true);
        setMessage({ type: 'success', text: 'Password reset link sent. Check your email.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to send reset link.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      padding: '20px',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #EF9F27 0%, #D4841F 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 4px 24px rgba(239, 159, 39, 0.3)',
          }}>
            <span style={{ fontSize: 32 }}>✍️</span>
          </div>
          <h1 style={{
            color: '#EF9F27',
            fontSize: 36,
            fontWeight: 700,
            marginBottom: 8,
            letterSpacing: -0.5,
          }}>
            DeepFlow
          </h1>
          <p style={{
            color: '#666',
            fontSize: 13,
            textTransform: 'uppercase',
            letterSpacing: 2,
          }}>
            ADHD Writing Instrument
          </p>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: '#141414',
          borderRadius: 16,
          padding: '32px 24px',
          border: '1px solid #222',
        }}>
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: 15,
                  borderRadius: 10,
                  border: '1px solid #333',
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#EF9F27'}
                onBlur={(e) => e.target.style.borderColor = '#333'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#888', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  style={{
                    width: '100%',
                    padding: '14px 48px 14px 16px',
                    fontSize: 15,
                    borderRadius: 10,
                    border: '1px solid #333',
                    backgroundColor: '#1a1a1a',
                    color: '#fff',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#EF9F27'}
                  onBlur={(e) => e.target.style.borderColor = '#333'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#666',
                    cursor: 'pointer',
                    fontSize: 13,
                    padding: '4px 8px',
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div style={{
                padding: '12px 16px',
                borderRadius: 10,
                marginBottom: 20,
                fontSize: 13,
                lineHeight: 1.5,
                backgroundColor: message.type === 'error' ? '#2a1515' : '#152a15',
                color: message.type === 'error' ? '#E24B4A' : '#4ade80',
                border: `1px solid ${message.type === 'error' ? '#E24B4A33' : '#4ade8033'}`,
              }}>
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: 15,
                fontWeight: 600,
                borderRadius: 10,
                border: 'none',
                cursor: loading ? 'wait' : 'pointer',
                marginBottom: 16,
                background: loading
                  ? '#666'
                  : 'linear-gradient(135deg, #EF9F27 0%, #D4841F 100%)',
                color: '#1a1a1a',
                transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 2px 12px rgba(239, 159, 39, 0.3)',
              }}
            >
              {loading ? '...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
          }}>
            <div style={{ flex: 1, height: 1, backgroundColor: '#333' }} />
            <span style={{ fontSize: 12, color: '#666' }}>or</span>
            <div style={{ flex: 1, height: 1, backgroundColor: '#333' }} />
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: 14,
              fontWeight: 500,
              borderRadius: 10,
              border: '1px solid #333',
              backgroundColor: 'transparent',
              color: '#fff',
              cursor: loading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              transition: 'all 0.2s',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Forgot Password */}
          {!isSignUp && !resetSent && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button
                onClick={handlePasswordReset}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#888',
                  cursor: 'pointer',
                  fontSize: 13,
                  padding: 0,
                  textDecoration: 'underline',
                  textDecorationColor: '#444',
                }}
              >
                Forgot password?
              </button>
            </div>
          )}
        </div>

        {/* Toggle Sign In / Sign Up */}
        <p style={{ textAlign: 'center', fontSize: 13, color: '#666', marginTop: 24 }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage(null);
              setResetSent(false);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#EF9F27',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              padding: 0,
            }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}
