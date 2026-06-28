import React from 'react';
import { useSearchParams } from 'react-router-dom';

export default function EmailConfirmed() {
  const [searchParams] = useSearchParams();
  const hasCode = searchParams.has('code');
  const isError = searchParams.has('error');

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
      <div style={{
        textAlign: 'center',
        padding: '48px 40px',
        maxWidth: 440,
        backgroundColor: '#141414',
        borderRadius: 20,
        border: '1px solid #222',
      }}>
        {isError ? (
          <>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: '#2a1515',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <span style={{ fontSize: 36 }}>❌</span>
            </div>
            <h1 style={{
              color: '#E24B4A',
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 12,
            }}>
              Confirmation Failed
            </h1>
            <p style={{
              color: '#888',
              fontSize: 15,
              lineHeight: 1.6,
              marginBottom: 32,
            }}>
              Something went wrong with your email confirmation. Please try signing in again.
            </p>
            <a
              href="/"
              style={{
                display: 'inline-block',
                backgroundColor: '#333',
                color: '#fff',
                padding: '16px 40px',
                borderRadius: 12,
                fontWeight: 600,
                fontSize: 15,
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              Go to Sign In
            </a>
          </>
        ) : hasCode ? (
          <>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #EF9F27 0%, #D4841F 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 4px 24px rgba(239, 159, 39, 0.3)',
            }}>
              <span style={{ fontSize: 36 }}>✍️</span>
            </div>
            <h1 style={{
              color: '#EF9F27',
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 12,
            }}>
              Email Confirmed
            </h1>
            <p style={{
              color: '#888',
              fontSize: 15,
              lineHeight: 1.6,
              marginBottom: 32,
            }}>
              Your account is ready. Open the DeepFlow app to sign in and start your first writing session.
            </p>
            <a
              href="deepflow://auth/callback"
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #EF9F27 0%, #D4841F 100%)',
                color: '#1a1a1a',
                padding: '16px 40px',
                borderRadius: 12,
                fontWeight: 600,
                fontSize: 15,
                textDecoration: 'none',
                marginBottom: 16,
                boxShadow: '0 2px 12px rgba(239, 159, 39, 0.3)',
                transition: 'all 0.2s',
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
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: '#1a2a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <span style={{ fontSize: 36 }}>🔗</span>
            </div>
            <h1 style={{
              color: '#EF9F27',
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 12,
            }}>
              Check Your Email
            </h1>
            <p style={{
              color: '#888',
              fontSize: 15,
              lineHeight: 1.6,
              marginBottom: 32,
            }}>
              We sent a confirmation link to your email address. Click the link to verify your account and get started.
            </p>
            <a
              href="/"
              style={{
                display: 'inline-block',
                backgroundColor: '#333',
                color: '#fff',
                padding: '16px 40px',
                borderRadius: 12,
                fontWeight: 600,
                fontSize: 15,
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              Back to Sign In
            </a>
          </>
        )}
      </div>
    </div>
  );
}
