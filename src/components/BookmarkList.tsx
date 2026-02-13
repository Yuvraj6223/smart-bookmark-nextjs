'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import BookmarkItem from './BookmarkItem';
import type { Bookmark } from '@/types';

interface BookmarkListProps {
  initialBookmarks: Bookmark[];
  userId: string;
}

export default function BookmarkList({ initialBookmarks, userId }: BookmarkListProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const { showToast } = useToast();
  // Generate a stable unique ID per component instance to avoid channel name
  // collisions when multiple tabs are open simultaneously. Without this,
  // Supabase silently drops duplicate channel subscriptions.
  const channelIdRef = useRef<string>(
    `bookmarks-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  );

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(channelIdRef.current)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newBookmark = payload.new as Bookmark;
          setBookmarks((prev) => {
            // Avoid duplicates from optimistic updates
            if (prev.some((b) => b.id === newBookmark.id)) return prev;
            return [newBookmark, ...prev];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const deletedId = payload.old?.id;
          if (deletedId) {
            setBookmarks((prev) => prev.filter((b) => b.id !== deletedId));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as Bookmark;
          setBookmarks((prev) =>
            prev.map((b) => (b.id === updated.id ? updated : b))
          );
        }
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR') {
          console.error('Realtime channel error:', err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleDelete = async (bookmarkId: string) => {
    const supabase = createClient();
    try {
      const { error } = await supabase.from('bookmarks').delete().eq('id', bookmarkId);

      if (error) throw error;

      // Optimistic remove
      setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
      showToast('Bookmark deleted', 'success');
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      showToast('Failed to delete bookmark', 'error');
    }
  };

  return (
    <div className="glass-card" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          padding: '16px 18px',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent-primary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          Your Bookmarks
        </h2>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--accent-primary)',
            background: 'var(--accent-glow)',
            padding: '4px 10px',
            borderRadius: 20,
          }}
        >
          {bookmarks.length}
        </span>
      </div>

      {/* Content */}
      {bookmarks.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ margin: '0 auto 16px', opacity: 0.5 }}
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 6,
            }}
          >
            No bookmarks yet
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Add your first bookmark to get started!
          </p>
        </div>
      ) : (
        <div>
          {bookmarks.map((bookmark, i) => (
            <BookmarkItem
              key={bookmark.id}
              bookmark={bookmark}
              onDelete={handleDelete}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
