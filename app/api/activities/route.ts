import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { fetchAllActivities } from "@/lib/strava"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await fetchAllActivities(session.accessToken)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 })
  }
}
