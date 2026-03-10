/**
 * Fetches all your Strava runs and saves them to data/demo.json.
 * Run once whenever you want to refresh the demo data:
 *
 *   npm run fetch-demo
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs"
import path from "path"

// Load .env.local
try {
  const env = readFileSync(".env.local", "utf-8")
  for (const line of env.split("\n")) {
    const eqIdx = line.indexOf("=")
    if (eqIdx === -1 || line.startsWith("#")) continue
    const key = line.slice(0, eqIdx).trim()
    const val = line.slice(eqIdx + 1).trim()
    if (key) process.env[key] = val
  }
} catch {
  // .env.local not found — rely on env vars already set in the shell
}

const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_DEMO_REFRESH_TOKEN } = process.env

if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET || !STRAVA_DEMO_REFRESH_TOKEN) {
  console.error("Missing env vars: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_DEMO_REFRESH_TOKEN")
  process.exit(1)
}

// Inline polyline decoder (no dependencies needed)
function decodePolyline(str) {
  const coords = []
  let lat = 0, lng = 0, i = 0
  while (i < str.length) {
    let b, shift = 0, result = 0
    do { b = str.charCodeAt(i++) - 63; result |= (b & 0x1f) << shift; shift += 5 } while (b >= 0x20)
    lat += (result & 1) ? ~(result >> 1) : (result >> 1)
    shift = 0; result = 0
    do { b = str.charCodeAt(i++) - 63; result |= (b & 0x1f) << shift; shift += 5 } while (b >= 0x20)
    lng += (result & 1) ? ~(result >> 1) : (result >> 1)
    coords.push([lng / 1e5, lat / 1e5])
  }
  return coords
}

// 1. Get a fresh access token
console.log("Refreshing access token...")
const tokenRes = await fetch("https://www.strava.com/oauth/token", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    client_id: STRAVA_CLIENT_ID,
    client_secret: STRAVA_CLIENT_SECRET,
    refresh_token: STRAVA_DEMO_REFRESH_TOKEN,
    grant_type: "refresh_token",
  }),
})
const { access_token } = await tokenRes.json()
if (!access_token) { console.error("Token refresh failed"); process.exit(1) }

// 2. Fetch all activities
console.log("Fetching activities...")
const features = []
let totalDistanceMeters = 0
let totalElevationMeters = 0
let page = 1

while (true) {
  const res = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?per_page=200&page=${page}&sport_type=Run`,
    { headers: { Authorization: `Bearer ${access_token}` } }
  )
  const activities = await res.json()
  if (!activities.length) break

  for (const activity of activities) {
    totalDistanceMeters += activity.distance ?? 0
    totalElevationMeters += activity.total_elevation_gain ?? 0

    const encoded = activity.map?.summary_polyline
    if (!encoded) continue

    const year = new Date(activity.start_date).getFullYear()
    const coordinates = decodePolyline(encoded)

    features.push({
      type: "Feature",
      geometry: { type: "LineString", coordinates },
      properties: { id: activity.id, name: activity.name, year },
    })
  }

  console.log(`  Page ${page}: ${features.length} runs so far...`)
  page++
}

// 3. Save to data/demo.json
const output = {
  geojson: { type: "FeatureCollection", features },
  stats: {
    totalRuns: features.length,
    totalMiles: totalDistanceMeters * 0.000621371,
    totalElevationFt: totalElevationMeters * 3.28084,
  },
}

mkdirSync("data", { recursive: true })
writeFileSync(path.join("data", "demo.json"), JSON.stringify(output))
console.log(`Done — saved ${features.length} runs to data/demo.json`)
