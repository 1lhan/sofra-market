import { prisma } from "@/lib/prisma"
import { AppError } from "@/lib/server/errors"
import { SelectOption } from "@/lib/types"
import { cacheLife, cacheTag, revalidateTag } from "next/cache"
import { CreateCategoryFormInput, UpdateCategoryFormInput } from "./category.schema"
import { CategoryAdminList, categoryAdminListSelect, CategoryWithSubcategories, categoryWithSubcategoriesSelect } from "./category.types"

export async function createCategory(data: CreateCategoryFormInput) {
    try {
        await prisma.category.create({ data })
    }
    catch (error) {
        const fields = (error as any)?.meta?.driverAdapterError?.cause?.constraint?.fields as string[] | undefined
        if (fields?.includes("name")) throw new AppError("Bu kategori adı zaten kullanılıyor", 400)
        if (fields?.includes("slug")) throw new AppError("Bu slug zaten kullanılıyor", 400)

        throw error
    }

    revalidateTag("categories", "max")
}

export async function updateCategory(id: string, data: UpdateCategoryFormInput) {
    try {
        await prisma.category.update({ where: { id }, data })
    }
    catch (error) {
        if ((error as any)?.code === "P2025") throw new AppError("Kategori bulunamadı", 404)

        const fields = (error as any)?.meta?.driverAdapterError?.cause?.constraint?.fields as string[] | undefined
        if (fields?.includes("name")) throw new AppError("Bu kategori adı zaten kullanılıyor", 400)
        if (fields?.includes("slug")) throw new AppError("Bu slug zaten kullanılıyor", 400)

        throw error
    }

    revalidateTag("categories", "max")
}

export async function deleteCategory(id: string) {
    try {
        await prisma.category.delete({ where: { id } })
    }
    catch (error) {
        if ((error as any)?.code === "P2025") throw new AppError("Kategori bulunamadı", 404)
        if ((error as any)?.cause?.originalCode === "23001") throw new AppError("Bu kategoriye bağlı ürün veya alt kategori var", 400)
        throw error
    }

    revalidateTag("categories", "max")
}

export async function getAdminCategories(): Promise<CategoryAdminList[]> {
    return prisma.category.findMany({
        select: categoryAdminListSelect,
        orderBy: { sortOrder: "asc" }
    })
}

export async function getCategoryOptions(): Promise<SelectOption[]> {
    const categories = await prisma.category.findMany({
        select: { id: true, name: true },
        orderBy: { sortOrder: "asc" }
    })

    return categories.map(c => ({ label: c.name, value: c.id }))
}

export async function getCategoriesWithSubcategories(): Promise<CategoryWithSubcategories[]> {
    return prisma.category.findMany({
        select: categoryWithSubcategoriesSelect,
        orderBy: { sortOrder: "asc" }
    })
}

export async function getCategoryBySlug(slug: string) {
    "use cache"
    cacheLife("max")
    cacheTag("categories")

    return prisma.category.findFirst({
        where: { OR: [{ slug }, { subcategories: { some: { slug } } }] },
        select: {
            name: true,
            slug: true,
            subcategories: {
                select: { name: true, slug: true }
            }
        }
    })
}