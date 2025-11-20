import { sdk } from "@lib/config"

export default async function localSearchProducts(query: string, country: string) {
  if (!query.trim()) return []

  // Native Medusa search (without Meilisearch)
  const { products } = await sdk.store.product.list(
    {
      title: query,
      limit: 20,
    },
    {
      next: { tags: ["products"] },
    }
  )

  return products || []
}
