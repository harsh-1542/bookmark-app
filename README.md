# Bookmark App

Production-ready README for the Bookmark App.

**Project overview**

- Small Next.js App Router application to save and share bookmarks.
- Users can sign up, set a unique handle during onboarding, and create bookmarks that are private by default or marked public.

**Features**

- Email/password authentication via Supabase.
- Onboarding with unique handle stored in `profiles` table.
- Create, read, update, delete (CRUD) bookmarks.
- Public profile pages at `/:handle` that list only public bookmarks.
- Welcome emails using Resend on signup.

**Tech stack**

- Next.js (App Router)
- TypeScript
- Supabase (Auth + Postgres)
- Tailwind CSS for UI
- Resend for transactional emails

**Installation**

1. Clone the repo

```bash
git clone <repo-url>
cd bookmarks-app
npm install
```

2. Create a `.env.local` with the environment variables listed below.

**Environment variables**

- `NEXT_PUBLIC_APP_URL` - e.g. `http://localhost:3000`
- `APP_ENV` - `development` / `production`
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key for client-side use
- `SUPABASE_SERVICE_ROLE_KEY` - ONLY for trusted server admin tasks (DO NOT expose in clients)
- `RESEND_API_KEY` - Resend API key for sending emails (store in environment)
- `RESEND_FROM_EMAIL` - From address for transactional emails

Example `.env.local` (do NOT commit):

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_ENV=development
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=pk.xyz
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon.xyz
SUPABASE_SERVICE_ROLE_KEY=service_role_xyz
RESEND_API_KEY=rp_...
RESEND_FROM_EMAIL="Bookmark App <no-reply@example.com>"
```

**Running locally**

```bash
npm run dev
# or for type checking
npm run type-check
```

**Deployment**

- Recommended: Vercel or any provider that supports Next.js App Router.
- Ensure all environment variables are set in the deployment environment (especially `RESEND_API_KEY` and Supabase keys).
- Apply database RLS policies (see `docs/bookmarks_rls.sql`) before pointing production to Supabase.

**AI Agent Corrections**

If the AI generated code required manual corrections, document them below so reviewers can verify and re-run tests.

- Correction 1: [describe file and change you made]
- Correction 2: [describe file and change you made]

---

See `docs/PRODUCTION_READINESS_REVIEW.md` and `docs/PRODUCTION_CHECKLIST.md` for a detailed review and checklist.

# Bookmarks App

A clean, fast bookmark manager built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**.

## Tech Stack

- **Next.js 15** — App Router, Server Components, Server Actions
- **TypeScript** — strict mode
- **Tailwind CSS v4** — utility-first styling
- **ESLint** — Next.js recommended flat config

## Prerequisites

| Tool    | Minimum version |
| ------- | --------------- |
| Node.js | 20.x            |
| npm     | 10.x            |

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Open .env.local and fill in your values

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command              | Description                       |
| -------------------- | --------------------------------- |
| `npm run dev`        | Start dev server with hot reload  |
| `npm run build`      | Production build                  |
| `npm run start`      | Serve the production build        |
| `npm run lint`       | Run ESLint                        |
| `npm run type-check` | Run TypeScript compiler (no emit) |

## Project Structure

```
bookmarks-app/
├── docs/                  # Architecture & contributing guides
├── public/                # Static assets
└── src/
    ├── app/               # Next.js App Router (routes, layouts)
    ├── components/
    │   ├── features/      # Domain-specific composite components
    │   ├── layout/        # Structural chrome (Header, Sidebar…)
    │   └── ui/            # Primitive UI components
    ├── config/            # Site config & typed env access
    ├── hooks/             # Custom React hooks
    ├── lib/               # Utilities & server helpers
    ├── styles/            # Global CSS (Tailwind entry point)
    └── types/             # Shared TypeScript types
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for a deeper dive.

## Environment Variables

Copy `.env.example` → `.env.local` and populate values.  
Never commit `.env.local` — it is gitignored.

| Variable              | Required | Description                                                    |
| --------------------- | -------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL` | No       | Public base URL (defaults to `http://localhost:3000`)          |
| `APP_ENV`             | No       | Runtime environment (`development` / `staging` / `production`) |

## License

MIT
