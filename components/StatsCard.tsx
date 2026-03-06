import type { ActivityStats } from "@/lib/strava"

function fmt(n: number, decimals = 0) {
  return n.toLocaleString("en-US", { maximumFractionDigits: decimals })
}

export default function StatsCard({ stats }: { stats: ActivityStats }) {
  return (
    <div className="absolute bottom-6 right-4 z-10 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg px-5 py-4">
      <div className="flex gap-6">
        <Stat label="Runs" value={fmt(stats.totalRuns)} />
        <Stat label="Miles" value={fmt(stats.totalMiles, 1)} />
        <Stat label="Elevation" value={`${fmt(stats.totalElevationFt)}′`} />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-lg font-semibold text-white leading-none">{value}</span>
      <span className="text-[11px] text-white/40 uppercase tracking-wider">{label}</span>
    </div>
  )
}
