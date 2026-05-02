import { auth } from "@/lib/auth";
import Elysia from "elysia";
import { headers } from "next/headers";
import { addToCartSchema, applyCouponSchema, deleteFromCartSchema, getCartSchema, removeCouponSchema, updateCartItemQuantitySchema } from "./cart.schema";
import { addToCart, applyCoupon, deleteFromCart, getCart, removeCoupon, updateCartItemQuantity } from "./cart.service";

export const cartRoutes = new Elysia({ prefix: "/carts" })
    .derive(async () => {
        const session = await auth.api.getSession({ headers: await headers() })
        return { userId: session?.user.id }
    })
    .get(
        "/",
        async ({ query, userId }) => {
            const data = await getCart(query, userId)
            return { success: true, data }
        },
        { query: getCartSchema }
    )
    .post(
        "/",
        async ({ body, userId }) => {
            const data = await addToCart(body, userId)
            return { success: true, data }
        },
        { body: addToCartSchema }
    )
    .patch(
        "/",
        async ({ body, userId }) => {
            const data = await updateCartItemQuantity(body, userId)
            return { success: true, data }
        },
        { body: updateCartItemQuantitySchema }
    )
    .delete(
        "/",
        async ({ query, userId }) => {
            const data = await deleteFromCart(query, userId)
            return { success: true, data }
        },
        { query: deleteFromCartSchema }
    )
    .post(
        "/coupons",
        async ({ body, userId }) => {
            const data = await applyCoupon(body, userId)
            return { success: true, data }
        },
        { body: applyCouponSchema }
    )
    .delete(
        "/coupons",
        async ({ query, userId }) => {
            const data = await removeCoupon(query, userId)
            return { success: true, data }
        },
        { query: removeCouponSchema }
    )