# Smart Bookmark App

> A real-time bookmark management application with Google OAuth authentication, private user data isolation, and live synchronization across sessions.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?logo=vercel)

---

## Live Demo

🔗 [https://smartbookmarknextjs.vercel.app/](https://smartbookmarknextjs.vercel.app/)

---

## Overview

Smart Bookmark App lets users save, manage, and sync bookmarks across devices in real time. Users authenticate via Google OAuth — no passwords are stored. Each user's bookmarks are completely isolated at the database level using Supabase Row Level Security (RLS), and changes propagate instantly to all open tabs via WebSocket-based real-time subscriptions. The UI features a premium dark theme with glassmorphism effects and is fully responsive across mobile and desktop.

---

## Tech Stack

| Layer              | Technology                                                          |
| ------------------ | ------------------------------------------------------------------- |
| **Framework**      | [Next.js 16](https://nextjs.org/) (App Router, Server Components)   |
| **Language**       | [TypeScript 5](https://www.typescriptlang.org/)                     |
| **Styling**        | [Tailwind CSS 4](https://tailwindcss.com/) + Custom CSS Design System |
| **Database**       | [Supabase](https://supabase.com/) (PostgreSQL)                      |
| **Authentication** | Supabase Auth with Google OAuth 2.0 (PKCE flow)                     |
| **Real-time**      | Supabase Realtime (WebSocket)                                       |
| **Deployment**     | [Vercel](https://vercel.com/) (Serverless)                          |

---

## Problems Encountered & How I Solved Them

This section documents the real challenges I ran into while building this application and the solutions I implemented for each one.

---

### Problem 1: TypeScript Type Conflicts with Supabase Client

**What happened:** I initially passed a generic `Database` type to `createServerClient<Database>(...)` to get type-safe database queries. This immediately caused a wall of type mismatches between my custom `Database` interface and the types expected internally by the `@supabase/ssr` library. The generics didn't align, and TypeScript refused to compile.

**What I tried first:** I spent time trying to adjust my `Database` type definition to match what Supabase expected, but the internal types in `@supabase/ssr` are complex and not well-documented for custom generics.

**How I solved it:** I removed the generic type parameter entirely from the client initialization calls in both `server.ts` and `middleware.ts`:

```typescript
// ❌ Before — caused type conflicts
const supabase = createServerClient<Database>(url, key, { ... });

// ✅ After — works without generic, types enforced at app layer
const supabase = createServerClient(url, key, { ... });
```

Type safety is still maintained through the `Bookmark` interface at the application layer — when fetching or inserting data, I cast the results to my typed interfaces. This gives me the type checking I need without fighting the library internals.

---

### Problem 2: Real-time Subscription Memory Leaks

**What happened:** After deploying the app, I noticed that navigating between pages or hot-reloading during development caused WebSocket connections to pile up. The browser's network tab showed dozens of active WebSocket connections. This happened because React's `useEffect` was subscribing to Supabase Realtime channels on mount, but the cleanup on unmount wasn't properly removing the channels.

**Root cause:** When the `BookmarkList` component unmounted (e.g., due to a route change or HMR), the Realtime channel continued listening in the background because I wasn't calling `supabase.removeChannel()` in the effect cleanup.

**How I solved it:** Added proper cleanup in the `useEffect` return function:

```typescript
useEffect(() => {
  const supabase = createClient();
  const channel = supabase
    .channel('bookmarks-channel')
    .on('postgres_changes', { event: 'INSERT', ... }, handler)
    .subscribe();

  return () => {
    supabase.removeChannel(channel); // ← cleanup on unmount
  };
}, [userId]);
```

This ensures that every time the component unmounts, the WebSocket channel is removed and the connection is closed.

---

### Problem 3: OAuth Redirect URL Mismatch Between Environments

**What happened:** Google OAuth login worked perfectly on `localhost:3000` but broke immediately when I deployed to Vercel. The error was a redirect URI mismatch — Google was rejecting the callback because the redirect URL baked into the sign-in request still pointed to `localhost`.

**Why it was tricky:** I originally hardcoded the redirect URL as `http://localhost:3000/api/auth/callback`. This worked during development but obviously failed in production where the domain was different.

**How I solved it:** Replaced the hardcoded URL with a dynamic construction using `window.location.origin`:

```typescript
// In AuthButton.tsx
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/api/auth/callback`,
  },
});
```

This automatically resolves to `http://localhost:3000/api/auth/callback` in development and `https://smart-bookmark-app.vercel.app/api/auth/callback` in production — no environment-specific configuration needed in the code.

> **Important:** You still need to add both URLs to Google Cloud Console's **Authorized redirect URIs** and to Supabase's **Redirect URLs** allowlist.

---

### Problem 4: Server-Side Auth Using `getSession()` Instead of `getUser()`

**What happened:** I initially used `supabase.auth.getSession()` in the middleware and server components to check if a user was authenticated. Everything seemed to work, but I discovered this is a **security vulnerability**. `getSession()` only reads the JWT from the cookie and decodes it locally — it does *not* verify the token with the Supabase Auth server. This means an expired or revoked token could still pass the auth check.

**The risk:** If a user's account was deleted or their session was revoked server-side, `getSession()` would still return a valid-looking session object from the stale JWT in the cookie.

**How I solved it:** Replaced all server-side auth checks with `getUser()`, which makes a network request to the Supabase Auth server to revalidate the token:

```typescript
// In middleware.ts — the comment is there as a reminder
// IMPORTANT: Do NOT use getSession() here.
// getUser() sends a request to the Supabase Auth server to revalidate the token.
const {
  data: { user },
} = await supabase.auth.getUser();
```

This adds a small latency cost per request, but it ensures that every protected route is genuinely authenticated against the auth server.

---

### Problem 5: Duplicate Bookmarks from Real-time + Optimistic Updates

**What happened:** When a user added a bookmark, it would briefly appear *twice* in the list. The flow was:

1. User submits form → bookmark is inserted into Supabase
2. Supabase Realtime fires an `INSERT` event → component adds the new bookmark to state
3. But sometimes the real-time event arrived so fast that the state already had the bookmark from a previous render cycle, causing a duplicate

**Why it was confusing:** The duplication was intermittent — it depended on the race between the Supabase insert response and the Realtime WebSocket event. Sometimes it appeared as a flash, sometimes it persisted.

**How I solved it:** Added a deduplication guard in the Realtime event handler before adding the bookmark to state:

```typescript
.on('postgres_changes', { event: 'INSERT', ... }, (payload) => {
  const newBookmark = payload.new as Bookmark;
  setBookmarks((prev) => {
    // Prevent duplicate if optimistic update already added it
    if (prev.some((b) => b.id === newBookmark.id)) return prev;
    return [newBookmark, ...prev];
  });
})
```

This check ensures that if the bookmark already exists in the array (by ID), the real-time event is simply ignored.

---

### Problem 6: Google Avatar Images Blocked by Next.js

**What happened:** After implementing the user profile section in the header (showing the user's Google avatar), the images failed to load with a 500 error. The browser showed a broken image icon.

**Root cause:** Next.js Image Optimization blocks external image domains by default for security reasons. Google profile pictures are served from `lh3.googleusercontent.com`, which wasn't in the allowlist.

**How I solved it:** Added the Google avatar domain to the `remotePatterns` in `next.config.ts`:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};
```

---

### Problem 7: Real-time Channel Name Collisions Across Tabs

**What happened:** Real-time sync worked correctly when the user had one or two tabs open, but broke silently when three or more tabs were open simultaneously. Bookmarks added in one tab wouldn't appear in some other tabs.

**Root cause:** Every tab was subscribing to a Supabase Realtime channel with the **same hardcoded name** (`'bookmarks-channel'`). Supabase silently drops duplicate channel subscriptions from the same client. Since all tabs share the same Supabase project credentials, the channels collided.

**How I solved it:** Generated a unique channel name per component instance using a combination of `Date.now()` and a random string, stored in a `useRef` to keep it stable across re-renders:

```typescript
const channelIdRef = useRef<string>(
  `bookmarks-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
);

// Then used in the subscription:
const channel = supabase
  .channel(channelIdRef.current)  // ← unique per tab/instance
  .on('postgres_changes', { ... })
  .subscribe();
```

This ensures each tab gets its own independent Realtime channel and receives all events.

---

### Problem 8: Delete Not Reflecting in Real-time Across Tabs

**What happened:** When a user deleted a bookmark, it disappeared from the current tab (because of the optimistic UI update), but other open tabs still showed the deleted bookmark until the page was manually refreshed.

**Root cause:** The original Realtime subscription only listened for `INSERT` events. I had forgotten to subscribe to `DELETE` and `UPDATE` events on the `bookmarks` table.

**How I solved it:** Extended the Realtime subscription to listen for all three event types:

```typescript
const channel = supabase
  .channel(channelIdRef.current)
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookmarks', filter: `user_id=eq.${userId}` }, handleInsert)
  .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'bookmarks', filter: `user_id=eq.${userId}` }, handleDelete)
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookmarks', filter: `user_id=eq.${userId}` }, handleUpdate)
  .subscribe();
```

Now INSERT, DELETE, and UPDATE events are all propagated in real time across every open tab.

---

### Problem 9: Responsive Layout Breaking on Mobile Devices

**What happened:** The app looked great on desktop but had several layout issues on mobile:
- The header elements overlapped on small screens
- The bookmark cards didn't adapt to narrow viewports
- Touch targets (buttons, links) were too small for comfortable mobile use
- The two-column layout for the form + bookmark list didn't stack properly

**How I solved it:** Implemented a mobile-first responsive design approach:

1. **CSS breakpoints:** Added `@media` queries at `768px` to switch from stacked mobile layouts to side-by-side desktop layouts
2. **Flexible components:** Converted fixed-width elements to use relative units (`%`, `rem`, `vw`)
3. **Touch-friendly sizing:** Ensured all interactive elements met the minimum 44×44px touch target guideline
4. **Viewport meta tag:** Confirmed the viewport meta tag was properly set for mobile scaling:

```css
/* Mobile-first base styles */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

/* Desktop: side-by-side layout */
@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 380px 1fr;
  }
}
```

---

## Key Takeaways

| # | Problem | Root Cause | Lesson Learned |
|---|---------|------------|----------------|
| 1 | Type conflicts with Supabase | Over-specifying library generics | Don't force generic types on third-party libraries; enforce types at your own layer |
| 2 | WebSocket memory leaks | Missing `useEffect` cleanup | Always clean up subscriptions, listeners, and connections in React effects |
| 3 | OAuth redirect mismatch | Hardcoded environment-specific URLs | Use `window.location.origin` for environment-agnostic URL construction |
| 4 | Insecure auth checks | `getSession()` doesn't verify tokens | Always use `getUser()` server-side for genuine token revalidation |
| 5 | Duplicate bookmarks | Race between optimistic UI and real-time events | Deduplicate by ID before adding to state |
| 6 | Blocked Google avatars | Next.js image domain allowlist | Configure `remotePatterns` for all external image sources |
| 7 | Real-time failing with 3+ tabs | Channel name collisions | Generate unique channel names per instance |
| 8 | Delete not syncing across tabs | Missing event subscriptions | Subscribe to INSERT, DELETE, and UPDATE — not just INSERT |
| 9 | Broken mobile layout | Fixed-width desktop-only styles | Design mobile-first; use CSS breakpoints for larger screens |

---

## Setup Instructions

### Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org/))
- **npm** or **yarn**
- **Supabase** account ([sign up](https://supabase.com/))
- **Google Cloud Console** account ([console](https://console.cloud.google.com/))

### Step 1 — Clone & Install

```bash
git clone <repository-url>
cd smart-bookmark-app
npm install
```

### Step 2 — Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project
2. Copy your **Project URL** and **Anon Key** from _Settings → API_
3. Open the **SQL Editor** and run the contents of `database-schema.sql`

### Step 3 — Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Navigate to _APIs & Services → Credentials_
4. Click **Create Credentials → OAuth 2.0 Client IDs**
   - Application type: **Web application**
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/callback
     https://<your-supabase-project>.supabase.co/auth/v1/callback
     ```
5. Copy the **Client ID** and **Client Secret**
6. In Supabase Dashboard, go to _Authentication → Providers → Google_:
   - Toggle **Enable**
   - Paste your Client ID and Client Secret
   - Save

### Step 4 — Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> ⚠️ Never commit `.env.local` — it is already in `.gitignore`.

### Step 5 — Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment (Vercel)

1. Push your code to a GitHub repository
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository
3. Configure **Environment Variables** in the Vercel dashboard:

   | Variable                       | Value                                    |
   | ------------------------------ | ---------------------------------------- |
   | `NEXT_PUBLIC_SUPABASE_URL`     | `https://<your-project>.supabase.co`     |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Your Supabase anon key                   |
   | `NEXT_PUBLIC_SITE_URL`         | `https://your-app.vercel.app`            |

4. Deploy — Vercel auto-detects Next.js and configures the build

### Post-Deployment Checklist

- [ ] Update **Google OAuth** redirect URIs to include your production URL
- [ ] Update **Supabase Auth** → _URL Configuration_ → **Site URL** to your production URL
- [ ] Add your production URL to Supabase **Redirect URLs** allowlist
- [ ] Verify Google OAuth login works end-to-end in production
- [ ] Test real-time sync across multiple browser tabs
- [ ] Confirm HTTPS is active (automatic on Vercel)

---

## License

MIT License — feel free to use this project for your own purposes.
