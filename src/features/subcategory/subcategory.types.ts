import { Prisma } from "@/generated/prisma/client"

export const subcategoryAdminListSelect = {
    id: true,
    name: true,
    slug: true,
    sortOrder: true,
    category: {
        select: {
            id: true,
            name: true
        }
    },
    _count: {
        select: {
            products: true
        }
    }
}

export type SubcategoryAdminList = Prisma.SubcategoryGetPayload<{ select: typeof subcategoryAdminListSelect }>