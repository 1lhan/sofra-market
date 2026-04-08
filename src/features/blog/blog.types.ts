import { Prisma } from "@/generated/prisma/client"

export const blogAdminListSelect = {
    id: true,
    title: true,
    slug: true,
    excerpt: true,
    image: true,
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
}

export const blogPublicSelect = {
} satisfies Prisma.BlogSelect

export const blogPublicDetailSelect = {
} satisfies Prisma.BlogSelect

export type BlogAdminList = Prisma.BlogGetPayload<{ select: typeof blogAdminListSelect }>
export type BlogAdminUpdate = Prisma.BlogGetPayload<{ select: typeof blogAdminUpdateSelect }>
export type BlogPublic = Prisma.BlogGetPayload<{ select: typeof blogPublicSelect }>
export type BlogPublicDetail = Prisma.BlogGetPayload<{ select: typeof blogPublicDetailSelect }>