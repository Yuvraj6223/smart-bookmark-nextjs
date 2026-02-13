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
    <div className="page-container">
      {/* Page header */}
      <div style={{ marginBottom: 32 }} className="animate-fade-in">
        <h1 className="page-title">
          My Bookmarks
        </h1>
        <p className="page-subtitle">
          Your personal bookmark collection — synced in real-time.
        </p>
      </div>

      {/* Grid — responsive via CSS classes */}
      <div className="bookmark-grid">
        <div>
          <BookmarkForm />
        </div>
        <div>
          <BookmarkList initialBookmarks={bookmarks || []} userId={user.id} />
        </div>
      </div>
    </div>
  );
}
