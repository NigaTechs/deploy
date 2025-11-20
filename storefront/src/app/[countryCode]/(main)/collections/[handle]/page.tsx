import { getCollectionsWithProducts } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { Suspense } from "react"
import { notFound } from "next/navigation"

import ProductPreview from "@modules/products/components/product-preview"
import { StoreCollection } from "@medusajs/types"

export const dynamic = "force-dynamic"

export default async function Home({
  params,
}: {
  params: { countryCode: string }
}) {
  const { countryCode } = params

  // 🔥 fetch all collections + their products
  const collections = await getCollectionsWithProducts(countryCode)
  const region = (await getRegion(countryCode)) ?? ({} as any)


if (!region) {
  console.warn("⚠️ No region found for:", countryCode)
}
if (!collections || collections.length === 0) {
  console.warn("⚠️ No collections for:", countryCode)
}



  return (
    <div className="flex flex-col gap-y-10 content-container py-6">
      {collections.map((collection: StoreCollection & { products?: any[] }) => (
        <div key={collection.id}>
          <h2 className="text-2xl font-semibold mb-4">{collection.title}</h2>

          {collection.products && collection.products.length > 0 ? (
            <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-6">
              {collection.products.map((product) => (
                <li key={product.id}>
                  <ProductPreview product={product} region={region} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No products found in this collection.</p>
          )}
        </div>
      ))}
    </div>
  )
}
