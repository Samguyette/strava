"use client"

import { useEffect, useRef, useState } from "react"
import type { FeatureCollection } from "geojson"

// Muted-but-distinct palette for dark backgrounds (Tailwind 400s)
const PALETTE = [
  "#60A5FA", // blue
  "#A78BFA", // violet
  "#F472B6", // pink
  "#34D399", // emerald
  "#FACC15", // yellow
  "#FB923C", // orange
  "#38BDF8", // sky
  "#F87171", // red
]

interface MapViewProps {
  geojson: FeatureCollection
}

export default function MapView({ geojson }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [yearColors, setYearColors] = useState<[number, string][]>([])

  useEffect(() => {
    if (!containerRef.current) return

    let map: import("maplibre-gl").Map

    const init = async () => {
      await import("maplibre-gl/dist/maplibre-gl.css" as string)
      const maplibregl = (await import("maplibre-gl")).default

      // Collect unique years in ascending order, assign palette colors
      const years = Array.from(
        new Set(
          geojson.features
            .map((f) => f.properties?.year as number)
            .filter(Boolean)
        )
      ).sort()

      const colorMap: [number, string][] = years.map((year, i) => [
        year,
        PALETTE[i % PALETTE.length],
      ])

      setYearColors(colorMap)

      // MapLibre match expression: ["match", ["get", "year"], year1, color1, ..., fallback]
      const matchExpr: unknown[] = ["match", ["get", "year"]]
      for (const [year, color] of colorMap) {
        matchExpr.push(year, color)
      }
      matchExpr.push("#FC4C02") // fallback

      map = new maplibregl.Map({
        container: containerRef.current!,
        style: "https://tiles.openfreemap.org/styles/dark",
        center: [0, 20],
        zoom: 2,
        attributionControl: false,
      })

      map.addControl(new maplibregl.NavigationControl(), "top-left")

      map.on("load", () => {
        map.addSource("routes", { type: "geojson", data: geojson })

        map.addLayer({
          id: "routes-layer",
          type: "line",
          source: "routes",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": matchExpr as unknown as string,
            "line-width": 1.5,
            "line-opacity": 0.6,
          },
        })

        if (geojson.features.length > 0) {
          const bounds = new maplibregl.LngLatBounds()
          for (const feature of geojson.features) {
            if (feature.geometry.type === "LineString") {
              for (const coord of feature.geometry.coordinates) {
                bounds.extend(coord as [number, number])
              }
            }
          }
          if (!bounds.isEmpty()) {
            map.fitBounds(bounds, { padding: 60, duration: 1000 })
          }
        }
      })
    }

    init()
    return () => map?.remove()
  }, [geojson])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {yearColors.length > 0 && (
        <div className="absolute bottom-6 left-4 z-10 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3 flex flex-col gap-2">
          {[...yearColors].reverse().map(([year, color]) => (
            <div key={year} className="flex items-center gap-2.5">
              <span
                className="w-5 h-px rounded-full"
                style={{ backgroundColor: color, opacity: 0.9 }}
              />
              <span className="text-xs text-white/60">{year}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
