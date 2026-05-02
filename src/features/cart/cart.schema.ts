import { t } from "elysia";

export const getCartSchema = t.Object({
    cartId: t.Union([t.String(), t.Null()])
})

export const addToCartSchema = t.Object({
    cartId: t.Union([t.String(), t.Null()]),
    productId: t.String(),
    quantity: t.Numeric({ minimum: 1 })
})

export const updateCartItemQuantitySchema = t.Object({
    cartId: t.Union([t.String(), t.Null()]),
    productId: t.String(),
    quantity: t.Numeric({ minimum: 1 })
})

export const deleteFromCartSchema = t.Object({
    cartId: t.Union([t.String(), t.Null()]),
    productId: t.String()
})

export const applyCouponSchema = t.Object({
    code: t.String(),
    cartId: t.Union([t.String(), t.Null()])
})

export const removeCouponSchema = t.Object({
    cartId: t.Union([t.String(), t.Null()])
})

export type GetCartInput = typeof getCartSchema.static
export type AddToCartInput = typeof addToCartSchema.static
export type UpdateCartItemQuantityInput = typeof updateCartItemQuantitySchema.static
export type DeleteFromCartInput = typeof deleteFromCartSchema.static
export type ApplyCouponInput = typeof applyCouponSchema.static
export type RemoveCouponInput = typeof removeCouponSchema.static