"use client"

import { useState, useEffect } from "react"
import type { HttpTypes } from "@medusajs/types"
import localSearchProducts from "@lib/util/local-search"

export default function SearchClient({ region, country }: any) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<HttpTypes.StoreProduct[]>([])   // FIXED HERE 👈

  useEffect(() => {
    if (!query) {
      setResults([])
      return
    }

    async function run() {
      const r = await localSearchProducts(query, country)
      setResults(r) // now valid
    }

    run()
  }, [query, country])

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <input
        className="border p-2 w-full"
        placeholder="Search products..."
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="mt-4">
        {results.map((p) => (
          <div key={p.id} className="py-2 border-b">
            {p.title}
          </div>
        ))}
      </div>
    </div>
  )
}
