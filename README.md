# Bookmarks App

A clean, fast bookmark manager built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**.

## Tech Stack

- **Next.js 15** — App Router, Server Components, Server Actions
- **TypeScript** — strict mode
- **Tailwind CSS v4** — utility-first styling
- **ESLint** — Next.js recommended flat config

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| Node.js | 20.x |
| npm | 10.x |

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

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
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

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | No | Public base URL (defaults to `http://localhost:3000`) |
| `APP_ENV` | No | Runtime environment (`development` / `staging` / `production`) |

## License

MIT
