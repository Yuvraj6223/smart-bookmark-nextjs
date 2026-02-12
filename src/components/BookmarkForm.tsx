'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { validateBookmarkForm } from '@/lib/utils/validation';
import { useToast } from '@/components/Toast';

export default function BookmarkForm() {
  const [formData, setFormData] = useState({ url: '', title: '' });
  const [errors, setErrors] = useState<{ url?: string; title?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateBookmarkForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase.from('bookmarks').insert({
        user_id: user.id,
        url: formData.url.trim(),
        title: formData.title.trim(),
      });

      if (error) throw error;

      setFormData({ url: '', title: '' });
      showToast('Bookmark added successfully!', 'success');
    } catch (error) {
      console.error('Error adding bookmark:', error);
      showToast('Failed to add bookmark. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <h2
        style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: 20,
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
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add Bookmark
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label
            htmlFor="url"
            style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              marginBottom: 6,
            }}
          >
            URL
          </label>
          <input
            type="url"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            className={`input-dark ${errors.url ? 'input-error' : ''}`}
            placeholder="https://example.com"
            maxLength={2048}
            disabled={isSubmitting}
            autoComplete="off"
          />
          {errors.url && (
            <p style={{ marginTop: 4, fontSize: '0.75rem', color: 'var(--error)' }}>
              {errors.url}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="title"
            style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              marginBottom: 6,
            }}
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`input-dark ${errors.title ? 'input-error' : ''}`}
            placeholder="My awesome bookmark"
            maxLength={200}
            disabled={isSubmitting}
            autoComplete="off"
          />
          {errors.title && (
            <p style={{ marginTop: 4, fontSize: '0.75rem', color: 'var(--error)' }}>
              {errors.title}
            </p>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ marginTop: 4 }}>
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" opacity="0.25" />
                <path d="M4 12a8 8 0 0 1 8-8" opacity="0.75" />
              </svg>
              Adding...
            </>
          ) : (
            'Add Bookmark'
          )}
        </button>
      </form>
    </div>
  );
}
