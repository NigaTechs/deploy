"use client"

import { ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useCart } from "medusa-react"
import clsx from "clsx"

export default function CartButton() {

  const { cart } = useCart()
const itemsCount =
  cart?.items?.reduce((acc: number, item: { quantity: number }) => acc + item.quantity, 0) || 0

  return (
    <Link
      href="/cart"
      className="relative flex items-center justify-center w-10 h-10"
      data-testid="nav-cart-link"
    >
      <ShoppingCart className="w-6 h-6 text-ui-fg-base hover:text-ui-fg-interactive transition-colors duration-150" />

      {itemsCount > 0 && (
        <span
          className={clsx(
            "absolute -top-1 -right-1 bg-red-600 text-white text-[11px]",
            "rounded-full w-5 h-5 flex items-center justify-center font-medium"
          )}
        >
          {itemsCount}
        </span>
      )}
    </Link>
  )
}
