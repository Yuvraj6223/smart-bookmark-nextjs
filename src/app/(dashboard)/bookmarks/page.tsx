import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BookmarkList from '@/components/BookmarkList';
import BookmarkForm from '@/components/BookmarkForm';

export default async function BookmarksPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: bookmarks, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bookmarks:', error);
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 16px' }}>
      {/* Page header */}
      <div style={{ marginBottom: 32 }} className="animate-fade-in">
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 6,
          }}
        >
          My Bookmarks
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Your personal bookmark collection — synced in real-time.
        </p>
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 24,
        }}
      >
        {/* On larger screens, use sidebar layout via CSS */}
        <div
          style={{
            display: 'grid',
            gap: 24,
          }}
          className="bookmark-grid"
        >
          <div>
            <BookmarkForm />
          </div>
          <div>
            <BookmarkList initialBookmarks={bookmarks || []} userId={user.id} />
          </div>
        </div>
      </div>

      {/* Responsive grid style */}
      <style>{`
        @media (min-width: 768px) {
          .bookmark-grid {
            grid-template-columns: 320px 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
