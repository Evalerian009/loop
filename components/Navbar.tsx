"use client"

import { useSession, signOut } from "next-auth/react"
import { Bell } from "lucide-react"

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <header className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
      {/* Logo */}
      <div className="text-lg font-semibold flex items-center gap-2">
        <span className="text-blue-400">📄</span>
        LiveDocs
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-6">
        <button className="hover:text-blue-400">
          <Bell size={20} />
        </button>

        {/* User avatar + dropdown */}
        <div className="relative group">
          <button className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
            {session?.user?.name?.charAt(0).toUpperCase() ?? "U"}
          </button>
          <div className="absolute right-0 mt-2 hidden group-hover:block bg-gray-800 rounded w-24 shadow-lg">
            <button
              onClick={() => signOut()}
              className="block px-4 py-2 text-sm hover:bg-gray-700 w-full text-left"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
