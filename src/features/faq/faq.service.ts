import { prisma } from "@/lib/prisma"
import { deleteEditorContentImages, prepareEditorContentForCreate, prepareEditorContentForUpdate } from "@/lib/server/editor-content"
import { AppError } from "@/lib/server/errors"
import { deleteFiles } from "@/lib/server/storage"
import { CreateFaqFormInput, UpdateFaqFormInput } from "./faq.schema"
import { FaqAdminList, faqAdminListSelect, FaqPublic, faqPublicSelect } from "./faq.types"

export async function createFaq(data: CreateFaqFormInput) {
    const { answer, answerImages, ...rest } = data

    const { content, imageUrls } = await prepareEditorContentForCreate(answer, answerImages)

    try {
        await prisma.faq.create({
            data: { ...rest, answer: content }
        })
    }
    catch (error) {
        await deleteFiles(imageUrls)
        throw error
    }
}

export async function updateFaq(id: string, data: UpdateFaqFormInput) {
    const { answer, answerImages, ...rest } = data

    const faq = await prisma.faq.findUnique({ where: { id }, select: { answer: true } })
    if (!faq) throw new AppError("S.S.S bulunamadı", 404)

    const { content, imageUrls, imageUrlsToDelete } = await prepareEditorContentForUpdate(faq.answer, answer, answerImages)

    try {
        await prisma.faq.update({
            where: { id },
            data: { ...rest, answer: content }
        })
    }
    catch (error) {
        await deleteFiles(imageUrls)
        throw error
    }

    await deleteFiles(imageUrlsToDelete)
}

export async function deleteFaq(id: string) {
    try {
        const deleted = await prisma.faq.delete({
            where: { id },
            select: { answer: true }
        })

        await deleteEditorContentImages(deleted.answer)
    }
    catch (error) {
        if ((error as any)?.code === "P2025") throw new AppError("S.S.S bulunamadı", 404)
        throw error
    }
}

export async function getAdminFaqs(): Promise<FaqAdminList[]> {
    return prisma.faq.findMany({
        select: faqAdminListSelect,
        orderBy: { sortOrder: "asc" }
    })
}

export async function getPublicFaqs(): Promise<FaqPublic[]> {
    return prisma.faq.findMany({
        select: faqPublicSelect,
        orderBy: { sortOrder: "asc" }
    })
}