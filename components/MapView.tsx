"use client"

import { useEffect, useRef } from "react"
import type { FeatureCollection } from "geojson"

interface MapViewProps {
  geojson: FeatureCollection
}

export default function MapView({ geojson }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    let map: import("maplibre-gl").Map

    const init = async () => {
      await import("maplibre-gl/dist/maplibre-gl.css" as string)
      const maplibregl = (await import("maplibre-gl")).default

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
            "line-color": "#FC4C02",
            "line-width": 1.5,
            "line-opacity": 0.6,
          },
        })

        // Fit map to all routes
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

  return <div ref={containerRef} className="w-full h-full" />
}
