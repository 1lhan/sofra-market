import { prisma } from "@/lib/prisma"
import { deleteEditorContentImages, prepareEditorContentForCreate, prepareEditorContentForUpdate } from "@/lib/server/editor-content"
import { AppError } from "@/lib/server/errors"
import { deleteFiles, saveFiles } from "@/lib/server/storage"
import { CreateBlogFormInput, UpdateBlogFormInput } from "./blog.schema"
import { BlogAdminList, blogAdminListSelect, BlogAdminUpdate, blogAdminUpdateSelect, BlogPublic, BlogPublicDetail, blogPublicDetailSelect, blogPublicSelect } from "./blog.types"

export async function createBlog(data: CreateBlogFormInput) {
    const { content, contentImages, image, products, ...rest } = data
    
    const [imageUrl, { processedContent, contentImageUrls }] = await Promise.all([
        image ? saveFiles([image]).then(urls => urls[0]) : Promise.resolve(null),
        prepareEditorContentForCreate(content, contentImages)
    ])

    try {
        await prisma.blog.create({
            data: {
                ...rest,
                content: processedContent,
                image: imageUrl,
                products: { connect: products?.map(id => ({ id })) }
            }
        })
    }
    catch (error) {
        await deleteFiles([...(imageUrl ? [imageUrl] : []), ...contentImageUrls])

        const constraint = (error as any)?.meta?.driverAdapterError?.cause?.constraint as Record<string, any>
        if (constraint?.fields?.includes("slug")) throw new AppError("Bu URL (slug) zaten kullanılıyor", 400)

        throw error
    }
}

export async function updateBlog(id: string, data: UpdateBlogFormInput) {
    const { content, contentImages, image, initialImage, products, ...rest } = data

    const blog = await prisma.blog.findUnique({
        where: { id },
        select: { content: true, image: true }
    })

    if (!blog) throw new AppError("Blog bulunamadı", 404)

    const [newImageUrl, { processedContent, contentImageUrls, contentImageUrlsToDelete }] = await Promise.all([
        image ? saveFiles([image]).then(urls => urls[0]) : Promise.resolve(null),
        prepareEditorContentForUpdate(blog.content, content, contentImages)
    ])

    try {
        await prisma.blog.update({
            where: { id },
            data: {
                ...rest,
                content: processedContent,
                image: newImageUrl ?? (initialImage?.length ? blog.image : null),
                products: { set: products?.map(id => ({ id })) ?? [] }
            }
        })
    }
    catch (error) {
        await deleteFiles([...((newImageUrl) ? [newImageUrl] : []), ...contentImageUrls])

        const constraint = (error as any)?.meta?.driverAdapterError?.cause?.constraint as Record<string, any>
        if (constraint?.fields?.includes("slug")) throw new AppError("Bu URL (slug) zaten kullanılıyor", 400)

        throw error
    }

    await deleteFiles([
        ...((blog.image && (image || !initialImage?.length)) ? [blog.image] : []),
        ...contentImageUrlsToDelete
    ])
}

export async function deleteBlog(id: string) {
    try {
        const deleted = await prisma.blog.delete({
            where: { id },
            select: { content: true, image: true }
        })

        await Promise.all([
            deleted.image ? deleteFiles([deleted.image]) : Promise.resolve(),
            deleteEditorContentImages(deleted.content)
        ])
    }
    catch (error) {
        if ((error as any)?.code === "P2025") throw new AppError("Blog bulunamadı", 404)
        throw error
    }
}

export async function getAdminBlogs(page: string | undefined, limit: number): Promise<{ total: number, data: BlogAdminList[] }> {
    const pageNumber = Math.max(1, Number(page) || 1)
    const offset = (pageNumber - 1) * limit

    const [total, data] = await Promise.all([
        prisma.blog.count(),
        prisma.blog.findMany({
            select: blogAdminListSelect,
            skip: offset,
            take: limit,
            orderBy: { createdAt: "desc" }
        })
    ])

    return { total, data }
}

export async function getBlogForUpdate(id: string): Promise<BlogAdminUpdate | null> {
    return prisma.blog.findUnique({
        where: { id },
        select: blogAdminUpdateSelect
    })
}

export async function getPublicBlogs(): Promise<BlogPublic[]> {
    return prisma.blog.findMany({
        select: blogPublicSelect,
        orderBy: { createdAt: "desc" }
    })
}

export async function getPublicBlogDetail(id: string): Promise<BlogPublicDetail | null> {
    return prisma.blog.findUnique({
        where: { id },
        select: blogPublicDetailSelect
    })
}