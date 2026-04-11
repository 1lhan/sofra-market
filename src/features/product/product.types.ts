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
    title: true,
    slug: true,
    price: true,
    comparePrice: true,
    images: true
} satisfies Prisma.ProductSelect

export const productPublicDetailSelect = {
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
    }
} satisfies Prisma.ProductSelect

export type ProductAdminList = Prisma.ProductGetPayload<{ select: typeof productAdminListSelect }>
export type ProductAdminUpdate = Prisma.ProductGetPayload<{ select: typeof productAdminUpdateSelect }>
export type ProductPublic = Omit<Prisma.ProductGetPayload<{ select: typeof productPublicSelect }>, "price" | "comparePrice"> & { price: number, comparePrice: number | null }
export type ProductPublicDetail = Omit<Prisma.ProductGetPayload<{ select: typeof productPublicDetailSelect }>, "price" | "comparePrice"> & { price: number, comparePrice: number | null }