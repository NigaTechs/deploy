"use client"

import { Suspense, useState } from "react"
import CartButton from "@modules/layout/components/cart-button"
import { useRouter } from "next/navigation"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto border-b duration-200 bg-white border-ui-border-base">
        <nav className="content-container txt-xsmall-plus text-ui-fg-subtle flex items-center justify-between w-full h-full text-small-regular">

          {/* LEFT */}
          <div className="flex-1 basis-0 h-full flex items-center">
            <SideMenu regions={regions} />
          </div>

          {/* CENTER */}
          <LocalizedClientLink
            href="/"
            className="txt-compact-xlarge-plus hover:text-ui-fg-base"
          >
            NigaTech
          </LocalizedClientLink>

          {/* RIGHT */}
          <RightSide />
        </nav>
      </header>
    </div>
  )
}

function RightSide() {
  const router = useRouter()

  return (
    <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">

      {/* Search Button */}
      <button
        onClick={() => router.push(`/${window.location.pathname.split("/")[1]}/search`)}
        className="p-2 hover:opacity-70"
        aria-label="Search"
      >
        🔍
      </button>

      <LocalizedClientLink
        className="hover:text-ui-fg-base"
        href="/account"
      >
        Account
      </LocalizedClientLink>

      <Suspense fallback={<span>Cart (0)</span>}>
        <CartButton />
      </Suspense>
    </div>
  )
}
