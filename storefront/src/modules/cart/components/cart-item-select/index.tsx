"use client"

import * as React from "react"
import { Minus, Plus } from "lucide-react"
type CartItemSelectProps = {
  value: number
  onChange: (val: number) => void
  min?: number
  max?: number
  className?: string
  ["data-testid"]?: string
}
const CartItemSelect: React.FC<CartItemSelectProps> = ({
  value,
  onChange,
  min = 1,
  max = 10,
  className,
  ...rest
}) => {
  const [qty, setQty] = React.useState<number>(value)

  React.useEffect(() => {
    setQty(value)
  }, [value])

  const handleChange = (newQty: number) => {
    if (newQty < min || newQty > max) return
    setQty(newQty)
    onChange?.(newQty)
  }

  return (
    <div
      className={[
        "flex items-center border border-gray-300 rounded-lg shadow-sm bg-white w-fit",
        className || "",
      ].join(" ")}
      {...rest}
    >
      <button
        type="button"
        onClick={() => handleChange(qty - 1)}
        disabled={qty <= min}
        className="flex items-center justify-center w-10 h-10 text-gray-700 hover:text-white hover:bg-blue-600 rounded-[3px] disabled:opacity-40 transition-colors duration-150"
        aria-label="Decrease quantity"
      >
        <Minus className="w-4 h-4" />
      </button>

      <span className="px-4 text-sm font-semibold text-gray-800 select-none">
        {qty}
      </span>

      <button
        type="button"
        onClick={() => handleChange(qty + 1)}
        disabled={qty >= max}
        className="flex items-center justify-center w-10 h-10 text-gray-700 hover:text-white hover:bg-blue-600 rounded-[3px] disabled:opacity-40 transition-colors duration-150"
        aria-label="Increase quantity"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  )
}

export default CartItemSelect
