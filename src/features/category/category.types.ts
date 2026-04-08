import { Prisma } from "@/generated/prisma/client"

export const categoryAdminListSelect = {
    id: true,
    name: true,
    slug: true,
    sortOrder: true,
    subcategories: {
        select: {
            name: true
        }
    },
    _count: {
        select: {
            products: true
        }
    }
}

export const categoryWithSubcategoriesSelect = {
    id: true,
    name: true,
    subcategories: {
        select: { id: true, name: true },
        orderBy: { sortOrder: "asc" as const }
    }
}

export type CategoryAdminList = Prisma.CategoryGetPayload<{ select: typeof categoryAdminListSelect }>
export type CategoryWithSubcategories = Prisma.CategoryGetPayload<{ select: typeof categoryWithSubcategoriesSelect }>