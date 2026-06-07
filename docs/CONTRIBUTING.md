# Contributing Guide

## Getting Started

```bash
git clone <repo-url>
cd bookmarks-app
cp .env.example .env.local   # fill in your values
npm install
npm run dev
```

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `dev` | Integration branch |
| `feat/<name>` | New features |
| `fix/<name>` | Bug fixes |

## Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/).

```
feat: add bookmark tagging
fix: correct date formatting on card
chore: update dependencies
docs: expand architecture notes
```

## Code Standards

- Run `npm run lint` and `npm run type-check` before pushing.
- Co-locate tests next to the file they test: `Button.test.tsx` beside `Button.tsx`.
- Keep components small and single-purpose.
- Server vs Client boundary: default to Server Components; add `"use client"` only when you need browser APIs or React state/effects.
