"use client"

import Link from "next/link"
import React, { useEffect, useState } from "react"
import { NotificationsDropdown } from "./NotificationsDropdown"
import { SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs"
import { PiSunDuotone, PiMoonStarsDuotone } from "react-icons/pi"

const Header = ({ children }: { children?: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(false)

  // Sync with localStorage + class on <html>
useEffect(() => {
  const root = document.documentElement
  const saved = localStorage.getItem("theme")
  if (saved === "dark") {
    root.classList.add("type-theme", "dark")
    setIsDark(true)
  } else {
    root.classList.add("type-theme")
  }
}, [])

const toggleTheme = () => {
  const root = document.documentElement
  if (isDark) {
    root.classList.remove("dark")
    localStorage.setItem("theme", "light")
  } else {
    root.classList.add("dark")
    localStorage.setItem("theme", "dark")
  }
  setIsDark(!isDark)
}

  return (
    <nav className="flex justify-between items-center py-4 px-6 bg-[color:var(--bg-secondary)] text-[color:var(--text)] border-b border-[color:var(--muted)]/40 left-0 w-full top-0 z-50 ">
      {/* Logo */}
      <Link
        href="/"
        className="text-xl font-bold tracking-tight hover:text-[color:var(--accent)] transition"
      >
        Type2geda
      </Link>

      {/* Center slot (optional children like search) */}
      <div className="flex-1 flex justify-center">{children}</div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-[color:var(--muted)]/10 transition"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <PiSunDuotone className="w-5 h-5 text-[color:var(--accent)]" />
          ) : (
            <PiMoonStarsDuotone className="w-5 h-5 text-[color:var(--accent)]" />
          )}
        </button>

        <NotificationsDropdown />

        <SignedIn>
          <SignOutButton>
            <button className="px-4 py-2 rounded-lg bg-[color:var(--accent)] text-sm font-medium hover:opacity-90 transition">
              Sign Out
            </button>
          </SignOutButton>
        </SignedIn>

        <SignedOut>
          <Link
            href="/sign-in"
            className="px-4 py-2 rounded-lg border border-[color:var(--accent)] text-[color:var(--accent)] text-sm font-medium hover:bg-[color:var(--accent)] hover:text-white transition"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 rounded-lg bg-[color:var(--accent)] text-sm font-medium hover:opacity-90 transition"
          >
            Sign Up
          </Link>
        </SignedOut>
      </div>
    </nav>
  )
}

export default Header