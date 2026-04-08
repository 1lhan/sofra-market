import { prisma } from "@/lib/prisma"
import { AppError } from "@/lib/server/errors"
import { revalidateTag } from "next/cache"
import { CreateSubcategoryFormInput, UpdateSubcategoryFormInput } from "./subcategory.schema"
import { SubcategoryAdminList, subcategoryAdminListSelect } from "./subcategory.types"

export async function createSubcategory(data: CreateSubcategoryFormInput) {
    try {
        await prisma.subcategory.create({ data })
    }
    catch (error) {
        const constraint = (error as any)?.meta?.driverAdapterError?.cause?.constraint as Record<string, any>
        if (constraint?.fields?.includes("name")) throw new AppError("Bu alt kategori adı zaten kullanılıyor", 400)
        if (constraint?.fields?.includes("slug")) throw new AppError("Bu slug zaten kullanılıyor", 400)
        if (constraint?.index?.includes("category_id")) throw new AppError("Kategori bulunamadı", 404)

        throw error
    }

    revalidateTag("subcategory", "max")
}

export async function updateSubcategory(id: string, data: UpdateSubcategoryFormInput) {
    try {
        await prisma.subcategory.update({ where: { id }, data })
    }
    catch (error) {
        if ((error as any)?.code === "P2025") throw new AppError("Alt kategori bulunamadı", 404)

        const constraint = (error as any)?.meta?.driverAdapterError?.cause?.constraint as Record<string, any>
        if (constraint?.fields?.includes("name")) throw new AppError("Bu alt kategori adı zaten kullanılıyor", 400)
        if (constraint?.fields?.includes("slug")) throw new AppError("Bu slug zaten kullanılıyor", 400)
        if (constraint?.index?.includes("category_id")) throw new AppError("Kategori bulunamadı", 404)

        throw error
    }

    revalidateTag("subcategory", "max")
}

export async function deleteSubcategory(id: string) {
    try {
        await prisma.subcategory.delete({ where: { id } })
    }
    catch (error) {
        if ((error as any)?.code === "P2025") throw new AppError("Alt kategori bulunamadı", 404)
        throw error
    }

    revalidateTag("subcategory", "max")
}

export async function getAdminSubcategories(): Promise<SubcategoryAdminList[]> {
    return prisma.subcategory.findMany({
        select: subcategoryAdminListSelect,
        orderBy: [
            { category: { sortOrder: "asc" } },
            { sortOrder: "asc" }
        ]
    })
}