// storefront/src/modules/search/templates/index.tsx
import { getRegion } from "@lib/data/regions"
import { getProductsListWithSort } from "@lib/data/products"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"

type Props = {
  query: string
  sortBy: SortOptions
  page: number
  countryCode: string
}

const PRODUCT_LIMIT = 12

export default async function SearchTemplate({
  query,
  sortBy,
  page,
  countryCode,
}: Props) {
  const region = await getRegion(countryCode)

  if (!region) {
    return (
      <div className="content-container py-10">
        <h1 className="text-2xl font-semibold mb-4">Search</h1>
        <p className="text-ui-fg-subtle">
          No region found for country code <code>{countryCode}</code>.
        </p>
      </div>
    )
  }

  const normalizedQuery = query?.trim() ?? ""

  if (!normalizedQuery) {
    return (
      <div className="content-container py-10">
        <h1 className="text-2xl font-semibold mb-4">Search</h1>
        <p className="text-ui-fg-subtle">
          Start typing in the search bar to find products.
        </p>
      </div>
    )
  }

  // TS types don't know about `q`, but the API supports it.
  const queryParams: any = {
    limit: PRODUCT_LIMIT,
    q: normalizedQuery,
  }

  const {
    response: { products, count },
  } = await getProductsListWithSort({
    page,
    sortBy,
    countryCode,
    queryParams,
  })

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  return (
    <div className="content-container py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          Search results for{" "}
          <span className="italic">“{normalizedQuery}”</span>
        </h1>
        <p className="text-ui-fg-subtle mt-1">
          {count === 0
            ? "No products found."
            : `${count} product${count === 1 ? "" : "s"} found.`}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="py-16 text-center text-ui-fg-subtle">
          Try another keyword or check our main store page.
        </div>
      ) : (
        <>
          <ul
            className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8"
            data-testid="products-list"
          >
            {products.map((p) => (
              <li key={p.id}>
                <ProductPreview product={p} region={region} />
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination page={page} totalPages={totalPages} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
