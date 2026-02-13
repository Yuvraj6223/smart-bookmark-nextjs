'use client';

import AuthButton from '@/components/AuthButton';

export default function LoginPage() {
  return (
    <div className="login-container">
      <div className="login-card animate-fade-in">
        {/* Logo & Heading */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'var(--accent-gradient)',
              marginBottom: 20,
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </div>

          <h1 className="login-heading">
            Smart Bookmarks
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
            Save, organize, and sync your bookmarks
            <br />
            in real-time across all your devices.
          </p>
        </div>

        {/* Sign-In Card */}
        <div className="glass-card" style={{ padding: 32, marginBottom: 32 }}>
          <AuthButton />

          <p
            style={{
              marginTop: 16,
              textAlign: 'center',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}
          >
            We only use your Google account for authentication.
            <br />
            Your bookmarks are private and encrypted.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="login-features-grid">
          <div className="feature-card" style={{ textAlign: 'center', padding: 16 }}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent-primary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ margin: '0 auto 8px' }}
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Save &amp; Organize
            </p>
          </div>

          <div className="feature-card" style={{ textAlign: 'center', padding: 16 }}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent-secondary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ margin: '0 auto 8px' }}
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Real-time Sync
            </p>
          </div>

          <div className="feature-card" style={{ textAlign: 'center', padding: 16 }}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ margin: '0 auto 8px' }}
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Private &amp; Secure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
