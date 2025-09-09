"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Navbar from "@/components/Navbar"
import DocumentList from "@/components/DocumentList"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in")
    }
  }, [status, router])

  // Fetch docs
  const fetchDocs = async () => {
    if (!session?.user?.email) return
    setLoading(true)

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("owner_email", session.user.email)
      .order("created_at", { ascending: false })

    if (error) {
      console.log("❌ Supabase fetch error:", error)
    } else {
      setDocs(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (status === "authenticated") fetchDocs()
  }, [status, session])

  // Create doc
  const createDoc = async () => {
    if (!session?.user?.email) return
    setLoading(true)
    const { error } = await supabase
      .from("documents")
      .insert({
        title: `Untitled Doc ${new Date().toLocaleTimeString()}`,
        content: "",
        owner_email: session.user.email,
      })
    if (error) console.log("Insert error:", error)
    fetchDocs()
    setLoading(false)
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">All documents</h1>
          <button
            onClick={createDoc}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
          >
            + Start a blank document
          </button>
        </div>

        <DocumentList
          docs={docs}
          loading={loading}
          fetchDocs={fetchDocs}
        />
      </main>
    </div>
  )
}