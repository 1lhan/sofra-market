import { Prisma } from "@/generated/prisma/client"

export const productAdminListSelect = {
    id: true,
    title: true,
    slug: true,
    price: true,
    comparePrice: true,
    stock: true,
    images: true,
    isActive: true,
    category: {
        select: {
            name: true
        }
    },
    subcategory: {
        select: {
            name: true
        }
    }
} satisfies Prisma.ProductSelect

export const productAdminUpdateSelect = {
    title: true,
    slug: true,
    excerpt: true,
    description: true,
    price: true,
    comparePrice: true,
    stock: true,
    images: true,
    isActive: true,
    categoryId: true,
    subcategoryId: true,
    metaTitle: true,
    metaDescription: true
} satisfies Prisma.ProductSelect

export const productPublicSelect = {
    id: true,
    title: true,
    slug: true,
    price: true,
    comparePrice: true,
    images: true,
    averageRating: true,
    _count: {
        select: {
            reviews: {
                where: { status: "APPROVED" }
            }
        }
    }
} satisfies Prisma.ProductSelect

export const productPublicDetailSelect = {
    id: true,
    title: true,
    slug: true,
    excerpt: true,
    description: true,
    price: true,
    comparePrice: true,
    images: true,
    category: {
        select: {
            name: true,
            slug: true
        }
    },
    subcategory: {
        select: {
            name: true,
            slug: true
        }
    },
    campaigns: {
        select: {
            title: true
        }
    }
} satisfies Prisma.ProductSelect

export type ProductAdminList = Prisma.ProductGetPayload<{ select: typeof productAdminListSelect }>
export type ProductAdminUpdate = Prisma.ProductGetPayload<{ select: typeof productAdminUpdateSelect }>
export type ProductPublic = Omit<Prisma.ProductGetPayload<{ select: typeof productPublicSelect }>, "price" | "comparePrice"> & { price: number, comparePrice: number | null }
export type ProductPublicDetail = Omit<Prisma.ProductGetPayload<{ select: typeof productPublicDetailSelect }>, "price" | "comparePrice"> & { price: number, comparePrice: number | null }