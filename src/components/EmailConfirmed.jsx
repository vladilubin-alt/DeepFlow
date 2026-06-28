import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function EmailConfirmed() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        setStatus(error ? 'error' : 'success');
      });
    } else {
      setStatus('success');
    }
  }, [searchParams]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <div style={{ textAlign: 'center', padding: '40px' }}>
        {status === 'loading' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <h1 style={{ color: '#EF9F27', fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
              Confirming your email...
            </h1>
            <p style={{ color: '#888', fontSize: 14 }}>Hang tight</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✍️</div>
            <h1 style={{ color: '#EF9F27', fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
              Email Confirmed
            </h1>
            <p style={{ color: '#888', fontSize: 14, marginBottom: 24, maxWidth: 320 }}>
              Your account is ready. Open the DeepFlow app to start your first session.
            </p>
            <a
              href="deepflow://auth/callback"
              style={{
                display: 'inline-block',
                backgroundColor: '#EF9F27',
                color: '#1a1a1a',
                padding: '12px 32px',
                borderRadius: 8,
                fontWeight: 500,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              Open DeepFlow
            </a>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
            <h1 style={{ color: '#E24B4A', fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
              Confirmation Failed
            </h1>
            <p style={{ color: '#888', fontSize: 14, marginBottom: 24, maxWidth: 320 }}>
              Something went wrong. Try opening the DeepFlow app and signing in again.
            </p>
            <a
              href="deepflow://auth/callback"
              style={{
                display: 'inline-block',
                backgroundColor: '#333',
                color: '#fff',
                padding: '12px 32px',
                borderRadius: 8,
                fontWeight: 500,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              Open DeepFlow
            </a>
          </>
        )}
      </div>
    </div>
  );
}
