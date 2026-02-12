# Smart Bookmark App

> A real-time bookmark management application with Google OAuth authentication, private user data isolation, and live synchronization across sessions.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?logo=vercel)

---

## Live Demo

<!-- Replace with your actual deployed URL -->
🔗 [https://smart-bookmark-app.vercel.app](https://smart-bookmark-app.vercel.app)

---

## Features

- **Google OAuth Authentication** — Secure sign-in via Google accounts (no passwords stored)
- **Add & Delete Bookmarks** — Save URLs with titles, remove them with a confirmation step
- **Real-time Synchronization** — Bookmarks update instantly across all open tabs and devices
- **Private Bookmark Storage** — Row Level Security enforces strict user data isolation
- **Mobile-Responsive Design** — Premium dark UI with glassmorphism, optimized for all screen sizes
- **Input Validation** — Client-side and server-side validation with user-friendly error feedback
- **Toast Notifications** — Animated success/error feedback for all operations

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server Components) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) + Custom CSS Design System |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL) |
| **Authentication** | Supabase Auth with Google OAuth 2.0 (PKCE flow) |
| **Real-time** | Supabase Realtime (WebSocket) |
| **Deployment** | [Vercel](https://vercel.com/) (Serverless) |
| **Linting** | ESLint with Next.js Core Web Vitals + TypeScript rules |

---

## Architecture Overview

### Application Flow

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Browser    │────▶│  Next.js (Vercel) │────▶│    Supabase     │
│             │◀────│  App Router + SSR  │◀────│  PostgreSQL +   │
│  React SPA  │     │  Middleware Auth   │     │  Realtime WS    │
└─────────────┘     └──────────────────┘     └─────────────────┘
       │                                              │
       │              Google OAuth 2.0                │
       └──────────────────────────────────────────────┘
```

### Authentication Flow

```
User ──▶ "Sign in with Google" ──▶ Google Consent Screen
                                          │
                                    User Approves
                                          │
                                          ▼
              /api/auth/callback ◀── Google Redirect (with code)
                     │
                     ▼
         exchangeCodeForSession(code)
                     │
                     ▼
           Session Cookie Set ──▶ Redirect to /bookmarks
```

### Real-time Sync Flow

```
Tab 1: INSERT bookmark ──▶ Supabase DB ──▶ Realtime Event
                                                 │
                                    ┌────────────┤
                                    ▼            ▼
                                  Tab 1        Tab 2
                               (optimistic)  (real-time)
                               UI updated    UI updated
```

---

## Project Structure

```
smart-bookmark-app/
├── middleware.ts                    # Next.js middleware (session refresh + route protection)
├── database-schema.sql             # Complete SQL schema with RLS policies
├── next.config.ts                  # Next.js config (Google avatar image domains)
├── eslint.config.mjs               # ESLint with core-web-vitals + TypeScript
├── ENV_EXAMPLE.md                  # Environment variable template
│
└── src/
    ├── app/
    │   ├── layout.tsx              # Root layout (Inter font, Header, Footer, ToastProvider)
    │   ├── page.tsx                # Landing page — redirects to /bookmarks or /login
    │   ├── globals.css             # Complete design system (dark theme, glassmorphism, animations)
    │   │
    │   ├── (auth)/
    │   │   └── login/
    │   │       └── page.tsx        # Login page with Google OAuth button + feature cards
    │   │
    │   ├── (dashboard)/
    │   │   └── bookmarks/
    │   │       └── page.tsx        # Protected bookmarks dashboard (SSR data fetching)
    │   │
    │   ├── api/
    │   │   └── auth/
    │   │       └── callback/
    │   │           └── route.ts    # OAuth callback — exchanges code for session
    │   │
    │   └── auth/
    │       └── error/
    │           └── page.tsx        # Auth error page with troubleshooting guide
    │
    ├── components/
    │   ├── AuthButton.tsx          # Google sign-in button with loading state
    │   ├── BookmarkForm.tsx        # Add bookmark form with validation
    │   ├── BookmarkList.tsx        # Bookmark list with real-time subscription
    │   ├── BookmarkItem.tsx        # Individual bookmark with delete confirmation
    │   ├── Toast.tsx               # Toast notification system (Context + Provider)
    │   └── Layout/
    │       ├── Header.tsx          # Sticky header with user avatar + sign-out
    │       └── Footer.tsx          # Footer with attribution links
    │
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts           # Browser-side Supabase client (createBrowserClient)
    │   │   ├── server.ts           # Server-side Supabase client (createServerClient)
    │   │   └── middleware.ts       # Session refresh + route protection logic
    │   └── utils/
    │       └── validation.ts       # URL and title validation utilities
    │
    └── types/
        └── index.ts                # TypeScript interfaces (Bookmark, Profile, Database)
```

---

## Database Schema

### Bookmarks Table

```sql
CREATE TABLE bookmarks (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title      VARCHAR(200)  NOT NULL,
  url        VARCHAR(2048) NOT NULL,
  created_at TIMESTAMPTZ   DEFAULT NOW(),
  updated_at TIMESTAMPTZ   DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_bookmarks_user_id    ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at DESC);
```

### Row Level Security (RLS) Policies

| Policy | Operation | Rule |
|---|---|---|
| Users can view own bookmarks | `SELECT` | `auth.uid() = user_id` |
| Users can insert own bookmarks | `INSERT` | `auth.uid() = user_id` |
| Users can delete own bookmarks | `DELETE` | `auth.uid() = user_id` |
| Users can update own bookmarks | `UPDATE` | `auth.uid() = user_id` |

> All policies ensure **complete user data isolation** — a user can never read, write, or delete another user's bookmarks, even if they bypass the UI.

### Realtime

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
```

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

## Deployment

### Vercel (Recommended)

1. Push your code to a GitHub repository
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository
3. Configure **Environment Variables** in the Vercel dashboard:

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<your-project>.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` |

4. Deploy — Vercel auto-detects Next.js and configures the build

### Post-Deployment Checklist

- [ ] Update **Google OAuth** redirect URIs to include your production URL
- [ ] Update **Supabase Auth** → _URL Configuration_ → **Site URL** to your production URL
- [ ] Add your production URL to Supabase **Redirect URLs** allowlist
- [ ] Verify Google OAuth login works end-to-end in production
- [ ] Test real-time sync across multiple browser tabs
- [ ] Confirm HTTPS is active (automatic on Vercel)

---

## Security

| Layer | Mechanism |
|---|---|
| **Authentication** | Google OAuth 2.0 with PKCE (handled by Supabase Auth) |
| **Session Validation** | `getUser()` on server-side (not `getSession()`) — revalidates token with Supabase Auth server |
| **Route Protection** | Next.js Middleware intercepts every request and redirects unauthenticated users |
| **Data Isolation** | PostgreSQL Row Level Security on all bookmark operations |
| **Input Validation** | Client-side (immediate feedback) + Database constraints (VARCHAR limits) |
| **XSS Prevention** | React auto-escapes rendered content |
| **SQL Injection** | Parameterized queries via Supabase client SDK |
| **Token Storage** | Secure cookies managed by `@supabase/ssr` |
| **HTTPS** | Enforced automatically on Vercel |

---

## Problems Encountered and Solutions

### Problem 1: TypeScript Type Conflicts with Supabase Client

**Context:** Passing a generic `Database` type to `createServerClient<Database>(...)` caused type mismatches with the Supabase SSR library.

**Solution:** Removed the generic type parameter from client initialization. The Supabase client works correctly without explicit database typing for standard CRUD operations. Types are enforced at the application layer via the `Bookmark` interface.

---

### Problem 2: Real-time Subscription Memory Leaks

**Context:** Forgetting to clean up Supabase Realtime channels in React's `useEffect` caused WebSocket connections to accumulate when components unmounted and remounted.

**Solution:** Implemented proper cleanup:
```typescript
useEffect(() => {
  const channel = supabase.channel('bookmarks-channel').on(/* ... */).subscribe();
  return () => {
    supabase.removeChannel(channel); // ← cleanup on unmount
  };
}, [userId]);
```

---

### Problem 3: OAuth Redirect URL Mismatch

**Context:** Google OAuth redirected to an incorrect callback URL, causing authentication failures in different environments (localhost vs. production).

**Solution:** Used `window.location.origin` for dynamic redirect URL construction:
```typescript
redirectTo: `${window.location.origin}/api/auth/callback`
```
This ensures the correct callback URL is used in any environment without hardcoding.

---

### Problem 4: Server-Side Auth with `getSession()` vs. `getUser()`

**Context:** Using `getSession()` in middleware and server components only checks the JWT locally without verifying it with the Supabase Auth server, which could allow expired or revoked tokens to pass.

**Solution:** Replaced all server-side auth checks with `getUser()`, which sends a request to the Supabase Auth server to revalidate the token. This is more secure and is the officially recommended approach.

---

### Problem 5: Duplicate Bookmarks from Real-time + Optimistic Updates

**Context:** When adding a bookmark, the real-time INSERT event could fire before or after the optimistic UI update, causing the same bookmark to appear twice.

**Solution:** Added a deduplication check in the real-time handler:
```typescript
if (prev.some((b) => b.id === (payload.new as Bookmark).id)) return prev;
```

---

### Problem 6: Google Avatar Images Blocked by Next.js

**Context:** User profile avatars from Google (`lh3.googleusercontent.com`) were blocked by Next.js Image Optimization because the domain wasn't allowlisted.

**Solution:** Added the Google avatar domain to `next.config.ts`:
```typescript
images: {
  remotePatterns: [{ protocol: 'https', hostname: 'lh3.googleusercontent.com' }],
},
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Your Supabase anonymous (public) key |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Your application URL (`http://localhost:3000` for dev) |

---

## Design System

The app uses a custom premium dark theme built on top of Tailwind CSS:

- **Color Palette:** Deep navy backgrounds (`#0a0b14`) with indigo/violet accent gradients
- **Typography:** [Inter](https://fonts.google.com/specimen/Inter) via `next/font/google`
- **Components:** Glassmorphism cards with `backdrop-filter: blur(20px)`
- **Animations:** Fade-in, slide-in/out, floating gradient orbs, skeleton loading
- **Responsiveness:** Mobile-first with breakpoints at 768px for grid layouts

---

## Future Enhancements

- 📋 **Bookmark editing** — Edit title and URL of existing bookmarks
- 🔍 **Search functionality** — Full-text search across bookmarks
- 🏷️ **Tags & categories** — Organize bookmarks with labels
- 📁 **Bookmark folders** — Hierarchical folder structure
- 📤 **Export/Import** — Export bookmarks as JSON, HTML, or CSV
- 🧩 **Chrome extension** — Save bookmarks directly from the browser
- 🔗 **Bookmark sharing** — Share collections with other users
- 📊 **Analytics dashboard** — Track bookmark usage and trends

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes and test thoroughly
4. Commit with a meaningful message: `git commit -m "feat: add bookmark search"`
5. Push and open a Pull Request

### Commit Convention

```
feat:     New feature
fix:      Bug fix
docs:     Documentation only
style:    Formatting, no logic change
refactor: Code restructuring
test:     Adding tests
chore:    Build process, dependencies
```

---

## License

MIT License — feel free to use this project for your own purposes.
