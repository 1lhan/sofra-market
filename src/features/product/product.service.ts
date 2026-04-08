import { prisma } from "@/lib/prisma"
import { deleteEditorContentImages, prepareEditorContentForCreate, prepareEditorContentForUpdate } from "@/lib/server/editor-content"
import { AppError } from "@/lib/server/errors"
import { deleteFiles, saveFiles } from "@/lib/server/storage"
import { SelectOption } from "@/lib/types"
import { revalidateTag } from "next/cache"
import { CreateProductFormInput, UpdateProductFormInput } from "./product.schema"
import { ProductAdminList, productAdminListSelect, ProductAdminUpdate, productAdminUpdateSelect, ProductPublic, ProductPublicDetail, productPublicDetailSelect, productPublicSelect } from "./product.types"

export async function createProduct(data: CreateProductFormInput) {
    const { description, descriptionImages, images, ...rest } = data

    if (data.comparePrice && data.comparePrice >= data.price) {
        throw new AppError("İndirimli fiyat, normal fiyattan düşük olmalıdır", 400)
    }

    const [imageUrls, { processedContent, contentImageUrls }] = await Promise.all([
        saveFiles(images),
        prepareEditorContentForCreate(description, descriptionImages)
    ])

    try {
        await prisma.product.create({
            data: {
                ...rest,
                description: processedContent,
                images: imageUrls
            }
        })
    }
    catch (error) {
        await deleteFiles([...imageUrls, ...contentImageUrls])

        const constraint = (error as any)?.meta?.driverAdapterError?.cause?.constraint as Record<string, any>
        if (constraint?.fields?.includes("slug")) throw new AppError("Bu URL (slug) zaten kullanılıyor", 400)
        if (constraint?.index?.includes("subcategory_id")) throw new AppError("Alt kategori bulunamadı", 404)
        if (constraint?.index?.includes("category_id")) throw new AppError("Kategori bulunamadı", 404)

        throw error
    }

    revalidateTag("product", "max")
}

export async function updateProduct(id: string, data: UpdateProductFormInput) {
    const { description, descriptionImages, images, initialImages, ...rest } = data

    if (data.comparePrice && data.comparePrice >= data.price) {
        throw new AppError("İndirimli fiyat, normal fiyattan düşük olmalıdır", 400)
    }

    const product = await prisma.product.findUnique({
        where: { id },
        select: { description: true, images: true }
    })

    if (!product) throw new AppError("Ürün bulunamadı", 404)

    const [newImageUrls, { processedContent, contentImageUrls, contentImageUrlsToDelete }] = await Promise.all([
        saveFiles(images),
        prepareEditorContentForUpdate(product.description, description, descriptionImages)
    ])

    try {
        await prisma.product.update({
            where: { id },
            data: {
                ...rest,
                description: processedContent,
                images: [...newImageUrls, ...(initialImages ?? [])]
            }
        })
    }
    catch (error) {
        await deleteFiles([...newImageUrls, ...contentImageUrls])

        if ((error as any)?.code === "P2025") throw new AppError("Ürün bulunamadı", 404)

        const constraint = (error as any)?.meta?.driverAdapterError?.cause?.constraint as Record<string, any>
        if (constraint?.fields?.includes("slug")) throw new AppError("Bu URL (slug) zaten kullanılıyor", 400)
        if (constraint?.index?.includes("subcategory_id")) throw new AppError("Alt kategori bulunamadı", 404)
        if (constraint?.index?.includes("category_id")) throw new AppError("Kategori bulunamadı", 404)

        throw error
    }

    await deleteFiles([
        ...product.images.filter(i => !initialImages?.includes(i)),
        ...contentImageUrlsToDelete
    ])

    revalidateTag("product", "max")
}

export async function deleteProduct(id: string) {
    try {
        const deleted = await prisma.product.delete({
            where: { id },
            select: { images: true, description: true }
        })

        await Promise.all([
            deleteFiles(deleted.images),
            deleteEditorContentImages(deleted.description)
        ])
    }
    catch (error) {
        if ((error as any)?.code === "P2025") throw new AppError("Ürün bulunamadı", 404)
        if ((error as any)?.cause?.originalCode === "23001") throw new AppError("Bu ürüne ait siparişler olduğu için silinemez", 400)
        throw error
    }

    revalidateTag("product", "max")
}

export async function getAdminProducts(page: string | undefined, limit: number): Promise<{ total: number, data: ProductAdminList[] }> {
    const pageNumber = Math.max(1, Number(page) || 1)
    const offset = (pageNumber - 1) * limit

    const [total, data] = await Promise.all([
        prisma.product.count(),
        prisma.product.findMany({
            select: productAdminListSelect,
            skip: offset,
            take: limit,
            orderBy: { createdAt: "desc" }
        })
    ])

    return { total, data }
}

export async function getProductForUpdate(id: string): Promise<ProductAdminUpdate | null> {
    return prisma.product.findUnique({
        where: { id },
        select: productAdminUpdateSelect
    })
}

export async function getPublicProducts(): Promise<ProductPublic[]> {
    return prisma.product.findMany({
        where: { isActive: true },
        select: productPublicSelect
    })
}

export async function getPublicProductDetail(id: string): Promise<ProductPublicDetail | null> {
    return prisma.product.findUnique({
        where: { id, isActive: true },
        select: productPublicDetailSelect
    })
}

export async function getProductOptions(): Promise<SelectOption[]> {
    const products = await prisma.product.findMany({
        select: { id: true, title: true },
        orderBy: { createdAt: "desc" }
    })

    return products.map(p => ({ label: p.title, value: p.id }))
}