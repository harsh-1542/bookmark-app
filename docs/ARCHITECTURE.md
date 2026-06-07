# Architecture Overview

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 15 (App Router) | RSC, Server Actions, file-based routing |
| Language | TypeScript (strict) | Type safety, better DX |
| Styling | Tailwind CSS v4 | Utility-first, no runtime overhead |
| Linting | ESLint (flat config) | Next.js recommended rules |

## Folder Conventions

```
src/
├── app/              # Next.js App Router: routes, layouts, loading, error states
├── components/
│   ├── ui/           # Primitive, reusable UI components (Button, Input, Badge…)
│   ├── layout/       # Structural chrome (Header, Footer, Sidebar, Shell…)
│   └── features/     # Domain-grouped composite components (bookmarks/, tags/…)
├── config/           # App-wide constants and env variable access
├── hooks/            # Custom React hooks
├── lib/              # Pure utilities, third-party wrappers, server helpers
├── styles/           # globals.css (Tailwind entry point + CSS tokens)
└── types/            # Shared TypeScript types and interfaces
```

## Environment Variables

- Server-only vars: plain `VARIABLE_NAME` — never exposed to the client.
- Client-safe vars: must be prefixed `NEXT_PUBLIC_`.
- All variables are documented in `.env.example`.
- Accessed via the typed wrapper in `src/config/env.ts`.

## Data Flow (planned)

```
Browser  →  Server Component / Route Handler
                ↓
           Service layer (src/lib/)
                ↓
           Database / external API
```

Server Actions will be co-located with the feature they serve under
`src/app/.../actions.ts` for clarity.
