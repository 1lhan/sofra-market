import { authenticatedAddressRoutes } from "@/features/address/address.route"
import { authRoutes } from "@/features/auth/auth.route"
import { adminBlogRoutes, publicBlogRoutes } from "@/features/blog/blog.route"
import { adminCampaignRoutes, publicCampaignRoutes } from "@/features/campaign/campaign.route"
import { adminCategoryRoutes, publicCategoryRoutes } from "@/features/category/category.route"
import { adminCouponRoutes, publicCouponRoutes } from "@/features/coupon/coupon.route"
import { adminFaqRoutes, publicFaqRoutes } from "@/features/faq/faq.route"
import { adminProductRoutes, publicProductRoutes } from "@/features/product/product.route"
import { adminSliderRoutes, publicSliderRoutes } from "@/features/slider/slider.route"
import { adminSubcategoryRoutes, publicSubcategoryRoutes } from "@/features/subcategory/subcategory.route"
import { AppError, formatValidationError } from "@/lib/server/errors"
import Elysia from "elysia"

const app = new Elysia({ prefix: "/api" })
    .error({ AppError })
    .onError(({ code, error, path, request }) => {
        if (code === "VALIDATION") {
            return { success: false, errors: formatValidationError((error as any).all) }
        }

        if (code === "AppError") {
            return { success: false, message: error.message }
        }

        console.error(`[${request.method}] ${path}`, error)
        return { success: false, message: "Something went wrong. Please try again later" }
    })
    .use(authRoutes)
    .use(adminCategoryRoutes)
    .use(publicCategoryRoutes)
    .use(adminSubcategoryRoutes)
    .use(publicSubcategoryRoutes)
    .use(adminProductRoutes)
    .use(publicProductRoutes)
    .use(adminFaqRoutes)
    .use(publicFaqRoutes)
    .use(adminBlogRoutes)
    .use(publicBlogRoutes)
    .use(adminSliderRoutes)
    .use(publicSliderRoutes)
    .use(adminCampaignRoutes)
    .use(publicCampaignRoutes)
    .use(adminCouponRoutes)
    .use(publicCouponRoutes)
    .use(authenticatedAddressRoutes)

export type App = typeof app

export const GET = app.fetch
export const POST = app.fetch
export const PUT = app.fetch
export const PATCH = app.fetch
export const DELETE = app.fetch