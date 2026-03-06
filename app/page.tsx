import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import ConnectButton from "@/components/ConnectButton"

export default async function LandingPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect("/map")

  return (
    <main className="flex flex-col items-center justify-center w-screen h-screen bg-black">
      <h1 className="text-2xl font-semibold tracking-tight text-white mb-2">
        Route Overlay
      </h1>
      <p className="text-sm text-white/50 mb-8">All your runs on one map</p>
      <ConnectButton />
    </main>
  )
}
