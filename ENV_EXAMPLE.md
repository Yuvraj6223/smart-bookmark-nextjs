# Environment Variables

Copy this template to `.env.local` and fill in your values.

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Where to find these values

| Variable | Location |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → `anon` `public` key |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` for development, your Vercel URL for production |
