import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { cache } from "react"
import { HttpTypes } from "@medusajs/types"

// 🔹 Keep the listRegions function — Nav depends on it
export const listRegions = cache(async function () {
  return sdk.store.region
    .list({}, { next: { tags: ["regions"] } })
    .then(({ regions }) => regions)
    .catch(medusaError)
})

export const retrieveRegion = cache(async function (id: string) {
  return sdk.store.region
    .retrieve(id, {}, { next: { tags: ["regions"] } })
    .then(({ region }) => region)
    .catch(medusaError)
})

const regionMap = new Map<string, HttpTypes.StoreRegion>()

// 🔹 Improved getRegion with fallback (this is the important part)
export const getRegion = cache(async function (countryCode?: string) {
  try {
    const regions = await listRegions()

    if (!regions || regions.length === 0) {
      console.warn("⚠️ No regions found in Medusa backend.")
      return null
    }

    // Cache region-country mappings
    regions.forEach((region) => {
      region.countries?.forEach((c) => {
        regionMap.set(c?.iso_2 ?? "", region)
      })
    })

    // Try to get by countryCode
    let region =
      (countryCode && regionMap.get(countryCode)) ||
      regions.find((r) => r.name.toLowerCase() === "zimb") ||
      regions.find((r) => r.name.toLowerCase() === "ghana") ||
      regions[0]

    if (!region) {
      console.error("❌ No matching region found, returning null.")
      return null
    }

    return region
  } catch (e) {
    console.error("❌ Error in getRegion:", e)
    return null
  }
})
