import React, { useState, useEffect } from 'react';

const CONSENT_KEY = 'deepflow_cookie_consent';

export function getConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch { return null; }
}

export function setConsent(value) {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {}
}

export default function CookieConsent({ onConsent }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getConsent();
    if (!consent) setVisible(true);
  }, []);

  const handleAccept = () => {
    setConsent('accepted');
    setVisible(false);
    if (onConsent) onConsent('accepted');
  };

  const handleReject = () => {
    setConsent('rejected');
    setVisible(false);
    if (onConsent) onConsent('rejected');
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      backgroundColor: '#16161F',
      borderTop: '1px solid #2A2A35',
      padding: '16px 24px',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.4)',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <p style={{ fontSize: 13, color: '#aaa', marginBottom: 12, lineHeight: 1.6 }}>
          We use analytics to understand how you use DeepFlow. No writing content is ever tracked.
          By continuing, you agree to our{' '}
          <a href="/privacy" style={{ color: '#EF9F27' }}>Privacy Policy</a>.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleAccept}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: '#EF9F27',
              color: '#1a1a1a',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Accept
          </button>
          <button
            onClick={handleReject}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 8,
              border: '1px solid #333',
              backgroundColor: 'transparent',
              color: '#888',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
