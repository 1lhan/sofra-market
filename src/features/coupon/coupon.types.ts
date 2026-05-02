import { Prisma } from "@/generated/prisma/client"

export const couponAdminListSelect = {
    id: true,
    code: true,
    title: true,
    image: true,
    isActive: true,
    startsAt: true,
    endsAt: true,
    usageLimit: true,
    usageCount: true
} satisfies Prisma.CouponSelect

export const couponAdminUpdateSelect = {
    code: true,
    title: true,
    description: true,
    image: true,
    isActive: true,
    startsAt: true,
    endsAt: true,
    discountType: true,
    discountValue: true,
    maxDiscountAmount: true,
    minOrderAmount: true,
    usageLimit: true,
    _count: {
        select: {
            orderDiscounts: true
        }
    }
} satisfies Prisma.CouponSelect

export const couponPublicSelect = {
    code: true,
    title: true,
    description: true,
    image: true
} satisfies Prisma.CouponSelect

export type CouponAdminList = Prisma.CouponGetPayload<{ select: typeof couponAdminListSelect }>
export type CouponAdminUpdate = Prisma.CouponGetPayload<{ select: typeof couponAdminUpdateSelect }>
export type CouponPublic = Prisma.CouponGetPayload<{ select: typeof couponPublicSelect }>