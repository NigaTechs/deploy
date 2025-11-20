"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { omit } from "lodash"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCartId,
  removeCartId,
  setCartId,
} from "./cookies"

import { getProductsById } from "./products"
import { getRegion } from "./regions"

/* ---------------------------------------------
   RETRIEVE CART
---------------------------------------------- */
export async function retrieveCart() {
  const cartId = getCartId()
  if (!cartId) return null

  try {
    const { cart } = await sdk.store.cart.retrieve(
      cartId,
      {},
      { next: { tags: ["cart"] }, ...getAuthHeaders() }
    )
    return cart
  } catch {
    return null
  }
}

/* ---------------------------------------------
   GET OR CREATE CART
---------------------------------------------- */
export async function getOrSetCart(countryCode: string) {
  let cart = await retrieveCart()
  const region = await getRegion(countryCode)

  if (!region) throw new Error("Region not found")

  // Create a new cart if none exists
  if (!cart) {
    const { cart: newCart } = await sdk.store.cart.create({
      region_id: region.id,
    })
    cart = newCart
    setCartId(cart.id)
    revalidateTag("cart")
  }

  // Switch regions if needed
  if (cart.region_id !== region.id) {
await sdk.store.cart.update(
  cart.id,
  { region_id: region.id },
  {},               // query params
  getAuthHeaders()  // headers
)

    revalidateTag("cart")
  }

  return cart
}

/* ---------------------------------------------
   UPDATE CART
---------------------------------------------- */
export async function updateCart(data: HttpTypes.StoreUpdateCart) {
  const cartId = getCartId()
  if (!cartId) throw new Error("No cart found")

  try {
const { cart } = await sdk.store.cart.update(
  cartId,
  data,
  {},               // <- empty query object
  getAuthHeaders()  // <- headers in 4th position
)

    revalidateTag("cart")
    return cart
  } catch (e) {
    throw medusaError(e)
  }
}

/* ---------------------------------------------
   ADD TO CART (FIXED)
---------------------------------------------- */
export async function addToCart({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}) {

  if (!variantId) throw new Error("Missing variant ID")

  const cart = await getOrSetCart(countryCode)

  try {
await sdk.store.cart.createLineItem(
  cart.id,
  {
    variant_id: variantId,
    quantity,
  },
  {},               // query
  getAuthHeaders()  // headers
)

  } catch (e) {
    throw medusaError(e)
  }

  revalidateTag("cart")

  // ✅ FIXES “Page Not Found” issue
  return {
    success: true,
    message: "Item added to cart",
    cartId: cart.id,
  }
}

/* ---------------------------------------------
   UPDATE LINE ITEM
---------------------------------------------- */
export async function updateLineItem({
  lineId,
  quantity,
}: {
  lineId: string
  quantity: number
}) {
  const cartId = getCartId()
  if (!cartId) throw new Error("No cart found")

  try {
await sdk.store.cart.updateLineItem(
  cartId,
  lineId,
  { quantity },
  {},               // query
  getAuthHeaders()  // headers
)

    revalidateTag("cart")
  } catch (e) {
    throw medusaError(e)
  }
}

/* ---------------------------------------------
   DELETE LINE ITEM
---------------------------------------------- */
export async function deleteLineItem(lineId: string) {
  const cartId = getCartId()
  if (!cartId) throw new Error("No cart found")

  try {
   await sdk.store.cart.deleteLineItem(
  cartId,
  lineId,
  {},               // query params
  getAuthHeaders()  // headers
)

    revalidateTag("cart")
  } catch (e) {
    throw medusaError(e)
  }
}

/* ---------------------------------------------
   ENRICH LINE ITEMS
---------------------------------------------- */
export async function enrichLineItems(
  lineItems:
    | HttpTypes.StoreCartLineItem[]
    | HttpTypes.StoreOrderLineItem[]
    | null,
  regionId: string
) {
  if (!lineItems?.length) return []

  const products = await getProductsById({
    ids: lineItems.map((li) => li.product_id!),
    regionId,
  })

  return lineItems.map((item) => {
    const product = products?.find((p: any) => p.id === item.product_id)
    const variant = product?.variants?.find(
      (v: any) => v.id === item.variant_id
    )

    if (!product || !variant) return item

    return {
      ...item,
      variant: {
        ...variant,
        product: omit(product, "variants"),
      },
    }
  })
}

/* ---------------------------------------------
   SET SHIPPING METHOD
---------------------------------------------- */
export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: string
  shippingMethodId: string
}) {
  try {
await sdk.store.cart.addShippingMethod(
  cartId,
  { option_id: shippingMethodId },
  {},               // query
  getAuthHeaders()  // headers
)

    revalidateTag("cart")
  } catch (e) {
    throw medusaError(e)
  }
}

/* ---------------------------------------------
   INITIATE PAYMENT
---------------------------------------------- */
export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: { provider_id: string; context?: Record<string, unknown> }
) {
  try {
   const resp = await sdk.store.payment.initiatePaymentSession(
  cart,
  data,
  {},               // query
  getAuthHeaders()  // headers
)

    revalidateTag("cart")
    return resp
  } catch (e) {
    throw medusaError(e)
  }
}

/* ---------------------------------------------
   APPLY PROMO
---------------------------------------------- */
export async function applyPromotions(codes: string[]) {
  return updateCart({ promo_codes: codes })
}

/* ---------------------------------------------
   ADDRESS FORM
---------------------------------------------- */
export async function setAddresses(_: unknown, formData: FormData) {
  const cartId = getCartId()
  if (!cartId) throw new Error("No cart found")

  const countryCode = formData.get("shipping_address.country_code")

  const data: any = {
    email: formData.get("email"),
    shipping_address: {
      first_name: formData.get("shipping_address.first_name"),
      last_name: formData.get("shipping_address.last_name"),
      address_1: formData.get("shipping_address.address_1"),
      postal_code: formData.get("shipping_address.postal_code"),
      city: formData.get("shipping_address.city"),
      country_code: countryCode,
      phone: formData.get("shipping_address.phone"),
    },
  }

  if (formData.get("same_as_billing") !== "on") {
    data.billing_address = {
      first_name: formData.get("billing_address.first_name"),
      last_name: formData.get("billing_address.last_name"),
      address_1: formData.get("billing_address.address_1"),
      postal_code: formData.get("billing_address.postal_code"),
      city: formData.get("billing_address.city"),
      country_code: formData.get("billing_address.country_code"),
      phone: formData.get("billing_address.phone"),
    }
  } else {
    data.billing_address = data.shipping_address
  }

  await updateCart(data)

  redirect(`/${countryCode}/checkout?step=delivery`)
}

/* ---------------------------------------------
   PLACE ORDER
---------------------------------------------- */
export async function placeOrder() {
  const cartId = getCartId()
  if (!cartId) throw new Error("No cart to complete")

  const cartRes = await sdk.store.cart
    .complete(cartId, {}, getAuthHeaders())
    .catch(medusaError)

  if (cartRes?.type === "order") {
    const country = cartRes.order.shipping_address?.country_code?.toLowerCase()
    removeCartId()
    redirect(`/${country}/order/confirmed/${cartRes.order.id}`)
  }

  return cartRes.cart
}

/* ---------------------------------------------
   UPDATE REGION
---------------------------------------------- */
export async function updateRegion(countryCode: string, currentPath: string) {
  const region = await getRegion(countryCode)
  if (!region) throw new Error("Region not found")

  const cartId = getCartId()
  if (cartId) await updateCart({ region_id: region.id })

  revalidateTag("cart")
  revalidateTag("regions")
  revalidateTag("products")

  redirect(`/${countryCode}${currentPath}`)
}
