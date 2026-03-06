"use client"

import { useEffect, useState } from "react"
import { signOut } from "next-auth/react"
import dynamic from "next/dynamic"
import type { FeatureCollection } from "geojson"
import type { ActivityStats, ActivitiesResult } from "@/lib/strava"
import StatsCard from "@/components/StatsCard"

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false })

export default function MapPage() {
  const [geojson, setGeojson] = useState<FeatureCollection | null>(null)
  const [stats, setStats] = useState<ActivityStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/activities")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load")
        return res.json()
      })
      .then((data: ActivitiesResult) => {
        setGeojson(data.geojson)
        setStats(data.stats)
        setLoading(false)
      })
      .catch(() => {
        setError("Failed to load activities")
        setLoading(false)
      })
  }, [])

  return (
    <div className="relative w-screen h-screen bg-black">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <p className="text-white/60 text-sm">Loading your runs...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {geojson && <MapView geojson={geojson} />}

      {stats && <StatsCard stats={stats} />}

      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="absolute top-4 right-4 z-10 px-3 py-1.5 text-xs text-white/60 hover:text-white border border-white/20 hover:border-white/40 rounded transition-colors bg-black/40 backdrop-blur-sm"
      >
        Disconnect
      </button>
    </div>
  )
}
