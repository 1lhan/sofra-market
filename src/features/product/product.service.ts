import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { deleteEditorContentImages, prepareEditorContentForCreate, prepareEditorContentForUpdate } from "@/lib/server/editor-content"
import { AppError } from "@/lib/server/errors"
import { deleteFiles, saveFiles } from "@/lib/server/storage"
import { SelectOption } from "@/lib/types"
import { revalidateTag } from "next/cache"
import { CreateProductFormInput, GetProductsQuery, UpdateProductFormInput } from "./product.schema"
import { ProductAdminList, productAdminListSelect, ProductAdminUpdate, productAdminUpdateSelect, ProductPublic, ProductPublicDetail, productPublicDetailSelect, productPublicSelect } from "./product.types"

export async function createProduct(data: CreateProductFormInput) {
    const { description, descriptionImages, images, ...rest } = data

    if (data.comparePrice && data.price >= data.comparePrice) {
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

    revalidateTag("products", "max")
}

export async function updateProduct(id: string, data: UpdateProductFormInput) {
    const { description, descriptionImages, images, initialImages, ...rest } = data

    if (data.comparePrice && data.price >= data.comparePrice) {
        throw new AppError("İndirimli fiyat, normal fiyattan düşük olmalıdır", 400)
    }

    const product = await prisma.product.findUnique({
        where: { id },
        select: { slug: true, description: true, images: true }
    })

    if ((images?.length ?? 0) + (initialImages?.length ?? 0) > 4) {
        throw new AppError("En fazla 4 görsel yüklenebilir", 400)
    }

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

    revalidateTag("products", "max")
    revalidateTag(`product-${product.slug}`, "max")
    if (data.slug !== product.slug) {
        revalidateTag(`product-${data.slug}`, "max")
    }
}

export async function deleteProduct(id: string) {
    try {
        const deleted = await prisma.product.delete({
            where: { id },
            select: { slug: true, images: true, description: true }
        })

        await Promise.all([
            deleteFiles(deleted.images),
            deleteEditorContentImages(deleted.description)
        ])

        revalidateTag("products", "max")
        revalidateTag(`product-${deleted.slug}`, "max")
    }
    catch (error) {
        if ((error as any)?.code === "P2025") throw new AppError("Ürün bulunamadı", 404)
        if ((error as any)?.cause?.originalCode === "23001") throw new AppError("Bu ürüne ait siparişler olduğu için silinemez", 400)
        throw error
    }
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

const sortToOrderBy: Record<string, any> = {
    featured: { createdAt: "desc" },
    best_selling: { orderItems: { _count: "desc" } },
    price_asc: { price: "asc" },
    price_desc: { price: "desc" },
    name_asc: { title: "asc" },
    name_desc: { title: "desc" }
}

export async function getPublicProducts(searchParams: GetProductsQuery, limit: number): Promise<{ total: number, data: ProductPublic[] }> {
    const { category, subcategory, categorySlug, priceMin, priceMax, filter, sort, page } = searchParams

    const pageNumber = Math.max(1, page ?? 1)
    const offset = (pageNumber - 1) * limit
    const filters = filter?.split(",") ?? []

    const where = {
        ...(category ? { category: { slug: { in: category.split(",") } } } : {}),
        ...(subcategory ? { subcategory: { slug: { in: subcategory.split(",") } } } : {}),
        ...(categorySlug ? {
            OR: [
                { category: { slug: categorySlug } },
                { subcategory: { slug: categorySlug } }
            ]
        } : {}),
        ...(priceMin || priceMax ? {
            price: {
                ...(priceMin ? { gte: +priceMin } : {}),
                ...(priceMax ? { lte: +priceMax } : {})
            }
        } : {}),
        ...(filters.includes("discounted") ? { comparePrice: { not: null } } : {}),
        ...(filters.includes("campaign") ? { campaigns: { some: {} } } : {}),
        isActive: true
    } satisfies Prisma.ProductWhereInput

    const [total, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
            where,
            select: productPublicSelect,
            skip: offset,
            take: limit,
            orderBy: sort ? (sortToOrderBy[sort] ?? {}) : {}
        })
    ])

    return {
        total,
        data: products.map(p => ({
            ...p,
            price: +p.price,
            comparePrice: p.comparePrice ? +p.comparePrice : null
        }))
    }
}

export async function getPublicProductDetail(slug: string): Promise<ProductPublicDetail | null> {
    const product = await prisma.product.findUnique({
        where: { slug, isActive: true },
        select: productPublicDetailSelect
    })

    if (!product) return null

    return {
        ...product,
        price: +product.price,
        comparePrice: product.comparePrice ? +product.comparePrice : null
    }
}

export async function getProductOptions(): Promise<SelectOption[]> {
    const products = await prisma.product.findMany({
        select: { id: true, title: true },
        orderBy: { createdAt: "desc" }
    })

    return products.map(p => ({ label: p.title, value: p.id }))
}