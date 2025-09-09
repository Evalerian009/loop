"use client"

import Link from "next/link"
import { Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Props {
  docs: any[]
  loading: boolean
  fetchDocs: () => void
}

export default function DocumentList({ docs, loading, fetchDocs }: Props) {
  const deleteDoc = async (id: string) => {
    const { error } = await supabase.from("documents").delete().eq("id", id)
    if (error) console.error("Delete error:", error)
    fetchDocs()
  }

  if (loading) {
    return <p className="text-gray-400">Loading documents...</p>
  }

  if (docs.length === 0) {
    return <p className="text-gray-400">No documents yet.</p>
  }

  return (
    <div className="space-y-3">
      {docs.map((doc) => (
        <div
          key={doc.id}
          className="flex justify-between items-center bg-gray-800 rounded px-4 py-3"
        >
          <div>
            <Link
              href={`/doc/${doc.id}`}
              className="font-medium hover:underline"
            >
              {doc.title}
            </Link>
            <p className="text-sm text-gray-400">
              Created{" "}
              {new Date(doc.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={() => deleteDoc(doc.id)}
            className="text-red-400 hover:text-red-500"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
    </div>
  )
}