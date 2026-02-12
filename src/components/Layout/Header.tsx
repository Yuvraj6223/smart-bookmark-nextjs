'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header
      style={{
        borderBottom: '1px solid var(--border-default)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(10, 11, 20, 0.8)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
        }}
      >
        {/* Logo */}
        <a
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--accent-gradient)',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            Smart Bookmarks
          </span>
        </a>

        {/* Right side */}
        {loading ? (
          <div className="skeleton" style={{ width: 120, height: 32 }} />
        ) : user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {user.user_metadata?.avatar_url ? (
                <Image
                  src={user.user_metadata.avatar_url}
                  alt="Avatar"
                  width={30}
                  height={30}
                  style={{ borderRadius: '50%' }}
                  unoptimized
                />
              ) : (
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: 'var(--accent-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: '#fff',
                  }}
                >
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <span
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)',
                  maxWidth: 160,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.email}
              </span>
            </div>
            <button onClick={handleLogout} className="btn-ghost">
              Sign out
            </button>
          </div>
        ) : (
          <a href="/login" className="btn-ghost">
            Sign in
          </a>
        )}
      </div>
    </header>
  );
}
