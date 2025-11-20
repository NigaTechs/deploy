import { cache } from "react"
import { sdk } from "@lib/config"
import { getProductsList } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import type { HttpTypes } from "@medusajs/types"

/**
 * Return ALL collections (array), not { collections }
 */
export const getCollectionsList = cache(async function (): Promise<HttpTypes.StoreCollection[]> {
  try {
    const { collections } = await sdk.store.collection.list(
      { limit: 100 },
      { next: { tags: ["collections"] } }
    )
    return collections ?? []
  } catch (e) {
    console.warn("⚠️ getCollectionsList failed:", e)
    return []
  }
})

/**
 * Get a single collection by handle.
 * Always returns a collection object OR null — never throws.
 */
export const getCollectionByHandle = cache(async function (
  handle: string
): Promise<HttpTypes.StoreCollection | null> {
  try {
    const { collections } = await sdk.store.collection.list(
      { handle, limit: 1 },
      { next: { tags: ["collections"] } }
    )
    return (collections && collections[0]) ?? null
  } catch (e) {
    console.warn("⚠️ getCollectionByHandle failed for handle:", handle, e)
    return null
  }
})

/**
 * Get all collections and attach their products for a given countryCode.
 * NEVER throws. Returns [] on any failure.
 */
export const getCollectionsWithProducts = cache(async function (
  countryCode: string
): Promise<Array<HttpTypes.StoreCollection & { products: HttpTypes.StoreProduct[] }>> {
  try {
    const region = await getRegion(countryCode)

    if (!region || !region.id) {
      console.warn("⚠️ getCollectionsWithProducts: missing/invalid region for", countryCode, region)
      return []
    }

    const { collections } = await sdk.store.collection.list(
      {},
      { next: { tags: ["collections"] } }
    )

    if (!collections || collections.length === 0) {
      console.warn("⚠️ getCollectionsWithProducts: no collections for", countryCode)
      return []
    }

    const results: Array<HttpTypes.StoreCollection & { products: HttpTypes.StoreProduct[] }> = []

    // Fetch products per collection (sequential keeps it simple & avoids rate spikes)
    for (const collection of collections) {
      try {
const { response } = await getProductsList({
  pageParam: 1,
  // 👇 Cast so TS stops complaining
  queryParams: {
    collection_id: [collection.id],
    region_id: region.id,
    limit: 100,
  } as unknown as Record<string, any>,
  countryCode,
})


        results.push({
          ...collection,
          products: response?.products ?? [],
        })
      } catch (e) {
        console.warn(`⚠️ Failed products fetch for collection ${collection.id}:`, e)
        results.push({
          ...collection,
          products: [],
        })
      }
    }

    return results
  } catch (e) {
    console.warn("⚠️ getCollectionsWithProducts failed:", e)
    return []
  }
})
