import { Prisma } from "@/generated/prisma/client"
import { productPublicSelect } from "../product/product.types"

export const blogAdminListSelect = {
    id: true,
    title: true,
    slug: true,
    excerpt: true,
    image: true,
    createdAt: true
} satisfies Prisma.BlogSelect

export const blogAdminUpdateSelect = {
    title: true,
    slug: true,
    excerpt: true,
    content: true,
    image: true,
    metaTitle: true,
    metaDescription: true,
    products: {
        select: {
            id: true
        }
    }
} satisfies Prisma.BlogSelect

export const blogPublicSelect = {
    title: true,
    slug: true,
    excerpt: true,
    image: true,
    createdAt: true
} satisfies Prisma.BlogSelect

export const blogPublicDetailSelect = {
    title: true,
    slug: true,
    excerpt: true,
    content: true,
    image: true,
    metaTitle: true,
    metaDescription: true,
    products: {
        select: productPublicSelect
    }
} satisfies Prisma.BlogSelect

export type BlogAdminList = Prisma.BlogGetPayload<{ select: typeof blogAdminListSelect }>
export type BlogAdminUpdate = Prisma.BlogGetPayload<{ select: typeof blogAdminUpdateSelect }>
export type BlogPublic = Prisma.BlogGetPayload<{ select: typeof blogPublicSelect }>
export type BlogPublicDetail = Prisma.BlogGetPayload<{ select: typeof blogPublicDetailSelect }>