import React from 'react';
import { useSearchParams } from 'react-router-dom';

export default function EmailConfirmed() {
  const [searchParams] = useSearchParams();
  const hasCode = searchParams.has('code');

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <div style={{ textAlign: 'center', padding: '40px', maxWidth: 400 }}>
        {hasCode ? (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✍️</div>
            <h1 style={{ color: '#EF9F27', fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
              Email Confirmed
            </h1>
            <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>
              Your account is ready. Open the DeepFlow app to sign in and start your first session.
            </p>
            <a
              href="deepflow://auth/callback"
              style={{
                display: 'inline-block',
                backgroundColor: '#EF9F27',
                color: '#1a1a1a',
                padding: '14px 36px',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 15,
                textDecoration: 'none',
                marginBottom: 16,
              }}
            >
              Open DeepFlow App
            </a>
            <p style={{ color: '#555', fontSize: 12 }}>
              On mobile? Tap the button above to open the app directly.
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
            <h1 style={{ color: '#EF9F27', fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
              Check Your Email
            </h1>
            <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>
              We sent a confirmation link to your email address. Click the link to verify your account.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
