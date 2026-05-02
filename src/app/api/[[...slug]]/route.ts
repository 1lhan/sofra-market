import { protectedAddressRoutes } from "@/features/address/address.route"
import { adminBlogRoutes, publicBlogRoutes } from "@/features/blog/blog.route"
import { adminCampaignRoutes } from "@/features/campaign/campaign.route"
import { cartRoutes } from "@/features/cart/cart.route"
import { adminCategoryRoutes } from "@/features/category/category.route"
import { adminCouponRoutes } from "@/features/coupon/coupon.route"
import { adminFaqRoutes } from "@/features/faq/faq.route"
import { adminProductRoutes, publicProductRoutes } from "@/features/product/product.route"
import { adminSliderRoutes } from "@/features/slider/slider.route"
import { adminSubcategoryRoutes } from "@/features/subcategory/subcategory.route"
import { userRoutes } from "@/features/user/user.route"
import { AppError, formatValidationError } from "@/lib/server/errors"
import Elysia from "elysia"

const app = new Elysia({ prefix: "/api" })
    .error({ AppError })
    .onError(({ code, error, path, request }) => {
        if (code === "VALIDATION") {
            console.log(error)
            return { success: false, errors: formatValidationError((error as any).all) }
        }

        if (code === "AppError") {
            return { success: false, message: error.message }
        }

        console.error(`[${request.method}] ${path}`, error)
        return { success: false, message: "Something went wrong. Please try again later" }
    })
    .use(adminCategoryRoutes)
    .use(adminSubcategoryRoutes)
    .use(adminProductRoutes)
    .use(publicProductRoutes)
    .use(adminFaqRoutes)
    .use(adminBlogRoutes)
    .use(publicBlogRoutes)
    .use(adminSliderRoutes)
    .use(adminCampaignRoutes)
    .use(adminCouponRoutes)
    .use(cartRoutes)
    .use(userRoutes)
    .use(protectedAddressRoutes)

export type App = typeof app

export const GET = app.fetch
export const POST = app.fetch
export const PUT = app.fetch
export const PATCH = app.fetch
export const DELETE = app.fetch