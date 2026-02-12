import Link from 'next/link';

export default function AuthErrorPage() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 128px)',
        padding: '40px 16px',
      }}
    >
      <div
        style={{ width: '100%', maxWidth: 440 }}
        className="animate-fade-in"
      >
        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--error-bg)',
              marginBottom: 16,
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--error)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 8,
            }}
          >
            Authentication Error
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            There was a problem signing you in. Please try again.
          </p>
        </div>

        {/* Help card */}
        <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
          <h3
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--warning)',
              marginBottom: 12,
            }}
          >
            Possible Solutions
          </h3>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
            }}
          >
            <li style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              Check that Google OAuth is configured correctly in Supabase
            </li>
            <li style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              Verify redirect URLs match in Google Console and Supabase
            </li>
            <li style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              Ensure environment variables are set correctly
            </li>
            <li style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              Clear browser cookies and try again
            </li>
          </ul>
        </div>

        <Link
          href="/login"
          className="btn-primary"
          style={{
            display: 'flex',
            width: '100%',
            textDecoration: 'none',
          }}
        >
          Try Again
        </Link>
      </div>
    </div>
  );
}
