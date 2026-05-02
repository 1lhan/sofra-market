import { auth } from "@/lib/auth";
import { AppError } from "@/lib/server/errors";
import Elysia, { t } from "elysia";
import { headers } from "next/headers";
import { createCouponSchema, updateCouponSchema } from "./coupon.schema";
import { createCoupon, deleteCoupon, getAdminCoupons, getCouponForUpdate, updateCoupon } from "./coupon.service";

export const adminCouponRoutes = new Elysia({ prefix: "/admin/coupons" })
    .derive(async () => {
        const session = await auth.api.getSession({ headers: await headers() })
        if (!session?.user.roles.includes("ADMIN")) throw new AppError("UNAUTHORIZED", 401)
    })
    .get(
        "/",
        async ({ query }) => {
            const data = await getAdminCoupons(query.page, 10)
            return { success: true, data }
        },
        { query: t.Object({ page: t.Optional(t.Numeric()) }) }
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