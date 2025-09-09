"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function SignInPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect if already signed in
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Checking session...</p>
      </main>
    )
  }

  if (status === "authenticated") {
    return null // Prevent flicker
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Welcome to LiveDocs</h1>

      <button
        onClick={() =>
          signIn("google").catch((err) =>
            console.error("Google sign-in failed:", err)
          )
        }
        aria-label="Sign in with Google"
        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg shadow"
      >
        Sign in with Google
      </button>
    </main>
  )
}