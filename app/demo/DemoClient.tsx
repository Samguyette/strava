"use client"

import dynamic from "next/dynamic"
import type { FeatureCollection } from "geojson"
import type { ActivityStats } from "@/lib/strava"
import StatsCard from "@/components/StatsCard"

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false })

interface Props {
  geojson: FeatureCollection
  stats: ActivityStats
}

export default function DemoClient({ geojson, stats }: Props) {
  return (
    <div className="relative w-screen h-screen bg-black">
      <MapView geojson={geojson} />
      <StatsCard stats={stats} />
      <a
        href="/"
        className="absolute top-4 right-4 z-10 px-3 py-1.5 text-xs text-white/60 hover:text-white border border-white/20 hover:border-white/40 rounded transition-colors bg-black/40 backdrop-blur-sm"
      >
        Connect yours ↗
      </a>
    </div>
  )
}
