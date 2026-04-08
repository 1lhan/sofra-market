import Elysia from "elysia";
import { createCouponSchema, updateCouponSchema } from "./coupon.schema";
import { createCoupon, deleteCoupon, getAdminCoupons, getCouponForUpdate, getPublicCouponDetail, getPublicCoupons, updateCoupon } from "./coupon.service";

export const adminCouponRoutes = new Elysia({ prefix: "/admin/coupons" })
    // .onBeforeHandle(async () => {
    //     await authorizeUser(["ADMIN"])
    // })
    .get(
        "/",
        async ({ query }) => {
            const data = await getAdminCoupons(query.page, 10)
            return { success: true, data }
        }
    )
    .post(
        "/",
        async ({ body }) => {
            await createCoupon(body)
            return { success: true }
        },
        { body: createCouponSchema }
    )
    .get(
        "/:id/edit",
        async ({ params: { id } }) => {
            const data = await getCouponForUpdate(id)
            return { success: true, data }
        }
    )
    .put(
        "/:id",
        async ({ params: { id }, body }) => {
            await updateCoupon(id, body)
            return { success: true }
        },
        { body: updateCouponSchema }
    )
    .delete(
        "/:id",
        async ({ params: { id } }) => {
            await deleteCoupon(id)
            return { success: true }
        }
    )

export const publicCouponRoutes = new Elysia({ prefix: "/coupons" })
    .get(
        "/",
        async () => {
            const data = await getPublicCoupons()
            return { success: true, data }
        }
    )
    .get(
        "/:id",
        async ({ params: { id } }) => {
            const data = await getPublicCouponDetail(id)
            return { success: true, data }
        }
    )