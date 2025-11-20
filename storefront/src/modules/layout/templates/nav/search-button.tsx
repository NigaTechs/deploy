"use client"

import { useRouter } from "next/navigation"

export default function SearchButton() {
  const router = useRouter()

  const handleSearch = () => {
    try {
      const country = window.location.pathname.split("/")[1] || "zw"
      router.push(`/${country}/search`)
    } catch {
      router.push(`/search`)
    }
  }

  return (
    <button
      aria-label="Search"
      onClick={handleSearch}
      className="p-2 hover:opacity-75"
    >
      🔍
    </button>
  )
}
