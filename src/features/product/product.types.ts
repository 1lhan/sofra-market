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
}

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
}

export const productPublicSelect: Prisma.ProductSelect = {
}

export const productPublicDetailSelect: Prisma.ProductSelect = {
}

export type ProductAdminList = Prisma.ProductGetPayload<{ select: typeof productAdminListSelect }>
export type ProductAdminUpdate = Prisma.ProductGetPayload<{ select: typeof productAdminUpdateSelect }>
export type ProductPublic = Prisma.ProductGetPayload<{ select: typeof productPublicSelect }>
export type ProductPublicDetail = Prisma.ProductGetPayload<{ select: typeof productPublicDetailSelect }>