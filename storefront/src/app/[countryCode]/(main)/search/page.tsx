import SearchClient from "./search-client"
import { getRegion } from "@lib/data/regions"

export default async function SearchPage({ params }: any) {
  const region = await getRegion(params.countryCode)

  return (
    <SearchClient
      region={region}
      country={params.countryCode}
    />
  )
}
