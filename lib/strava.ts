import polyline from "@mapbox/polyline"
import type { FeatureCollection, Feature, LineString } from "geojson"

const STRAVA_API = "https://www.strava.com/api/v3"

export interface ActivityStats {
  totalRuns: number
  totalMiles: number
  totalElevationFt: number
}

export interface ActivitiesResult {
  geojson: FeatureCollection
  stats: ActivityStats
}

export async function fetchAllActivities(accessToken: string): Promise<ActivitiesResult> {
  const features: Feature<LineString>[] = []
  let totalDistanceMeters = 0
  let totalElevationMeters = 0
  let page = 1

  while (true) {
    const res = await fetch(
      `${STRAVA_API}/athlete/activities?per_page=200&page=${page}&sport_type=Run`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    if (!res.ok) throw new Error(`Strava API error: ${res.status}`)

    const activities = await res.json()
    if (!activities.length) break

    for (const activity of activities) {
      totalDistanceMeters += activity.distance ?? 0
      totalElevationMeters += activity.total_elevation_gain ?? 0

      const encoded: string | undefined = activity.map?.summary_polyline
      if (!encoded) continue

      // Decode polyline: returns [lat, lng] pairs — swap to [lng, lat] for GeoJSON
      const coords = polyline
        .decode(encoded)
        .map(([lat, lng]: [number, number]) => [lng, lat])

      features.push({
        type: "Feature",
        geometry: { type: "LineString", coordinates: coords },
        properties: { id: activity.id, name: activity.name },
      })
    }

    page++
  }

  return {
    geojson: { type: "FeatureCollection", features },
    stats: {
      totalRuns: features.length,
      totalMiles: totalDistanceMeters * 0.000621371,
      totalElevationFt: totalElevationMeters * 3.28084,
    },
  }
}
