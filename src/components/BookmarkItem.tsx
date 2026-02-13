'use client';

import { useState } from 'react';
import type { Bookmark } from '@/types';

interface BookmarkItemProps {
  bookmark: Bookmark;
  onDelete: (id: string) => void;
  index: number;
}

export default function BookmarkItem({ bookmark, onDelete, index }: BookmarkItemProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(bookmark.id);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const hostname = (() => {
    try {
      return new URL(bookmark.url).hostname.replace('www.', '');
    } catch {
      return bookmark.url;
    }
  })();

  return (
    <div
      className="bookmark-item animate-fade-in"
      style={{
        animationDelay: `${index * 50}ms`,
        animationFillMode: 'backwards',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {/* Favicon + Content */}
      <div className="bookmark-item-content">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            textDecoration: 'none',
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
        >
          {bookmark.title}
        </a>
        <p
          style={{
            marginTop: 4,
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {hostname}
        </p>
        <p style={{ marginTop: 4, fontSize: '0.6875rem', color: 'var(--text-muted)', opacity: 0.7 }}>
          {formatDate(bookmark.created_at)}
        </p>
      </div>

      {/* Delete controls */}
      <div className="bookmark-item-actions">
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            title="Delete bookmark"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: 4,
              borderRadius: 6,
              transition: 'color 0.2s ease',
              display: 'flex',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--error)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        ) : (
          <>
            <button onClick={handleDelete} disabled={isDeleting} className="btn-danger">
              {isDeleting ? '...' : 'Delete'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
              className="btn-ghost"
              style={{ padding: '6px 10px', fontSize: '0.75rem' }}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
