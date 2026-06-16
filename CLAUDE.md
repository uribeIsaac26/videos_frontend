# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # TypeScript compilation + Vite production build
npm run lint      # ESLint (flat config, TypeScript-aware)
npm run preview   # Serve the production build locally
```

No test runner is configured.

## Environment

Requires a `VITE_API_URL` environment variable pointing to the backend. All API calls use `credentials: "include"` for cookie-based auth — the backend must set an HTTP-only session cookie on login.

## Architecture

**Stack:** React 19 + TypeScript (strict) + React Router v7 + Vite. No state management library, no CSS framework, no HTTP client — only native `fetch` and custom CSS.

### Layer structure

```
src/
├── api/          # Raw fetch wrappers, one file per resource
├── services/     # Business logic (only AuthService.ts today)
├── types/        # Shared TypeScript interfaces
├── pages/        # Route-level components (one per route)
└── components/   # Reusable UI pieces
```

### Routing & auth

`main.tsx` wraps the app in `BrowserRouter`. Routes are defined in `App.tsx`. All routes except `/login` are guarded by `PrivateRoute`, which calls `checkAuth()` on mount and redirects to `/login` on 401.

### State management conventions

- **No global store.** State lives in components via `useState`/`useEffect`.
- **URL as state:** Pagination, active tag filters, and sort order are stored in search params (`useSearchParams`) for deep-link and back-button support.
- **Route state for navigation:** `VideoListPage` passes the full video array + current index via React Router `navigate()` location state to `VideoPlayerPage`, enabling prev/next without a refetch.

### API layer

Each file in `src/api/` exports typed functions that call `fetch`. No abstraction layer — errors are handled inline, 401s redirect to `/login`. Video upload uses `XMLHttpRequest` (not `fetch`) specifically to support upload progress callbacks; uploads are chunked to max 50 concurrent requests.

### Key non-obvious behaviors

- **Thumbnail memory management:** `VideoCard` fetches thumbnails as blob URLs on mount and calls `URL.revokeObjectURL` in the `useEffect` cleanup.
- **Long-press multi-select:** `TagListPage` implements a custom 600ms long-press to enter multi-select mode with `navigator.vibrate` haptic feedback.
- **AI suggestions bridge:** `PredictionCard` receives AI-suggested tag names and must resolve them to real tag IDs by calling `getTagsByNames()` before the tags can be applied.
- **Modal dismissal:** Tag-management overlays use `onMouseDown` on the backdrop element (checking `e.target === e.currentTarget`) rather than a separate overlay div.
