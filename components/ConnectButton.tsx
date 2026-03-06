"use client"

import { signIn } from "next-auth/react"

export default function ConnectButton() {
  return (
    <button
      onClick={() => signIn("strava", { callbackUrl: "/map" })}
      className="px-6 py-3 rounded font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
      style={{ backgroundColor: "#FC4C02" }}
    >
      Connect with Strava
    </button>
  )
}
