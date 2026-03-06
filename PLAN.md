# Strava Route Overlay — Project Plan

## Overview

A minimalist, fullscreen web app that authenticates with Strava via OAuth and renders all of a user's runs as overlaid polylines on a dark monochrome map. Built for Vercel deployment.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | Vercel-native, server components, API routes |
| UI | shadcn/ui + Tailwind CSS | Minimalist, clean, unstyled primitives |
| Map renderer | MapLibre GL JS | Open source, performant, no license cost |
| Map tiles | OpenFreeMap (`dark` style) | Completely free, no API key, dark monochrome |
| Auth | NextAuth.js (Strava provider) | Handles OAuth flow + session management |
| Deployment | Vercel | Zero-config Next.js deployment |

---

## App Structure

```
/
├── app/
│   ├── page.tsx                  # Landing page (unauthenticated)
│   ├── map/
│   │   └── page.tsx              # Fullscreen map (authenticated)
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts      # NextAuth Strava OAuth handler
│       └── activities/
│           └── route.ts          # Fetches all activities from Strava API
├── components/
│   ├── MapView.tsx               # MapLibre GL map + polyline rendering
│   └── ConnectButton.tsx         # "Connect with Strava" CTA button
├── lib/
│   └── strava.ts                 # Strava API helpers (fetch all activities, decode polylines)
└── middleware.ts                 # Redirect unauthenticated users from /map to /
```

---

## Pages

### `/` — Landing Page
- Fullscreen, centered layout
- App name / minimal tagline
- "Connect with Strava" button (shadcn `Button`, Strava orange `#FC4C02`)
- If already authenticated, redirect to `/map`

### `/map` — Map Page
- 100vw / 100vh MapLibre GL canvas
- Dark monochrome base map (OpenFreeMap `dark` style)
- All runs rendered as polylines in Strava orange (`#FC4C02`), slight opacity for overlap density effect
- Small logout button (top-right corner, minimal/ghost style)
- Protected route — unauthenticated users redirected to `/`

---

## Data Flow

```
User clicks "Connect with Strava"
  -> NextAuth initiates OAuth with Strava
  -> Strava redirects back with auth code
  -> NextAuth exchanges code for access_token + refresh_token
  -> Session stored (access_token included)

User lands on /map
  -> Client fetches GET /api/activities
  -> API route uses session access_token to call Strava API
  -> Fetches all activities (paginated, runs only via `type=Run`)
  -> Returns array of encoded polylines (summary_polyline from Strava)

MapView component
  -> Decodes polylines using @mapbox/polyline
  -> Adds each as a GeoJSON LineString source + layer in MapLibre
  -> Fits map bounds to encompass all routes
```

---

## Strava API Notes

- **Endpoint**: `GET https://www.strava.com/api/v3/athlete/activities`
- **Pagination**: Max 200 per page — must loop until empty response
- **Polyline field**: `map.summary_polyline` on each activity (encoded)
- **Scopes needed**: `activity:read_all` (or `activity:read` for public only)
- **Token refresh**: NextAuth handles refresh token rotation if configured

---

## Environment Variables

```env
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://your-app.vercel.app

STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
```

Set all four in the Vercel project dashboard.

---

## Key Implementation Details

### Polyline Rendering
- Decode `summary_polyline` strings using `@mapbox/polyline`
- Combine all routes into a single GeoJSON `FeatureCollection`
- Single MapLibre layer with `line-color: #FC4C02`, `line-width: 1.5`, `line-opacity: 0.6`
- Opacity creates natural density effect where routes overlap (popular areas glow brighter)

### Map Style
- OpenFreeMap tile URL: `https://tiles.openfreemap.org/styles/dark`
- No API key required

### Performance
- All polyline fetching happens server-side in the API route
- Client receives pre-decoded GeoJSON — no heavy decoding in browser
- Consider caching activity response (e.g., 1hr) to avoid hammering Strava rate limits

---

## Implementation Steps

1. `npx create-next-app@latest` with TypeScript + Tailwind
2. Install shadcn/ui (`npx shadcn@latest init`)
3. Install dependencies: `next-auth`, `maplibre-gl`, `@mapbox/polyline`
4. Configure NextAuth with Strava provider
5. Build landing page + ConnectButton
6. Build `/api/activities` route with pagination
7. Build MapView component with MapLibre + polyline rendering
8. Wire up middleware for route protection
9. Deploy to Vercel, set env vars

---

## Follow-up Features (not in scope for v1)

- **Route interactivity**: Click a polyline to see activity details (date, distance, pace, elevation)
- **Stats card**: Total runs, total miles, total elevation — overlay or slide-in panel
- **Heatmap mode**: Density-based coloring instead of flat opacity
- **Filtering**: By date range, activity type, distance
- **Personal records**: Highlight PR routes differently
