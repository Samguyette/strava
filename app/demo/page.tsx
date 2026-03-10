import { readFileSync } from "fs"
import path from "path"
import { notFound } from "next/navigation"
import type { ActivitiesResult } from "@/lib/strava"
import DemoClient from "./DemoClient"

export default function DemoPage() {
  let data: ActivitiesResult
  try {
    const raw = readFileSync(path.join(process.cwd(), "data/demo.json"), "utf-8")
    data = JSON.parse(raw)
  } catch {
    notFound()
  }

  return <DemoClient geojson={data.geojson} stats={data.stats} />
}
