import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { cache } from "react"
import { getRegion } from "./regions"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { sortProducts } from "@lib/util/sort-products"

/**
 * ✅ Get products by their IDs
 */
export const getProductsById = cache(async function ({
  ids,
  regionId,
}: {
  ids: string[]
  regionId: string
}) {
  const { products } = await sdk.store.product.list(
    {
      id: ids,
      region_id: regionId,
      fields: "*variants.calculated_price,+variants.inventory_quantity",
    },
    { next: { tags: ["products"] } }
  )
  return products
})

/**
 * ✅ Get single product by handle
 */
export const getProductByHandle = cache(async function (
  handle: string,
  regionId: string
) {
  const { products } = await sdk.store.product.list(
    {
      handle,
      region_id: regionId,
      fields: "*variants.calculated_price,+variants.inventory_quantity",
    },
    { next: { tags: ["products"] } }
  )
  return products[0]
})

/**
 * ✅ Get all products directly from Medusa (bypassing MeiliSearch)
 * Pagination-ready and region-aware
 */
export const getProductsList = cache(async function ({
  pageParam = 1,
  queryParams,
  countryCode,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> {
  console.log("🔥 getProductsList CALLED with countryCode:", countryCode)

  const limit = queryParams?.limit || 12
  const validPageParam = Math.max(pageParam, 1)
  const offset = (validPageParam - 1) * limit

  // 🔥 Try to resolve region, fallback to the first available one
  let region = await getRegion(countryCode)

  if (!region) {
    console.warn(
      `⚠️ No region found for countryCode "${countryCode}". Attempting fallback...`
    )
    try {
      const { regions } = await sdk.store.region.list()
      region = regions?.[0]
      if (region) {
        console.log("✅ Fallback region used:", region.name, region.id)
      }
    } catch (e) {
      console.error("❌ Failed to fetch fallback region:", e)
    }
  }

  if (!region) {
    console.error("❌ Still no region found — returning empty product list.")
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const { products, count } = await sdk.store.product.list(
    {
      limit,
      offset,
      region_id: region.id,
      fields: "*variants.calculated_price,+variants.inventory_quantity",
      ...queryParams,
    },
    { next: { tags: ["products"] } }
  )

  console.log(`🧩 ${products.length} products fetched for region:`, region.name)

  const nextPage = count > offset + limit ? pageParam + 1 : null

  return {
    response: { products, count },
    nextPage,
    queryParams,
  }
})

/**
 * ✅ Sort & paginate products client-side
 */
export const getProductsListWithSort = cache(async function ({
  page = 1, // ⚠ start pages from 1, not 0
  queryParams,
  sortBy = "created_at",
  countryCode,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> {
  const limit = queryParams?.limit || 12

  const {
    response: { products, count },
  } = await getProductsList({
    pageParam: 1, // fetch first 100
    queryParams: {
      ...queryParams,
      limit: 100,
    },
    countryCode,
  })

  const sortedProducts = sortProducts(products, sortBy)

  // ✅ page is now 1-based
  const start = (page - 1) * limit
  const end = start + limit

  const paginatedProducts = sortedProducts.slice(start, end)
  const nextPage = end < count ? page + 1 : null

  console.log(
    `⚙️ getProductsListWithSort returning ${paginatedProducts.length} of ${count} products (page ${page})`
  )

  return {
    response: {
      products: paginatedProducts,
      count,
    },
    nextPage,
    queryParams,
  }
})

