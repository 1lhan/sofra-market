import { prisma } from "@/lib/prisma"
import { AppError } from "@/lib/server/errors"
import { deleteFiles, saveFiles } from "@/lib/server/storage"
import { CreateSliderFormInput, UpdateSliderFormInput } from "./slider.schema"
import { SliderAdminList, sliderAdminListSelect, SliderPublic, sliderPublicSelect } from "./slider.types"

export async function createSlider(data: CreateSliderFormInput) {
    const { image, mobileImage, ...rest } = data

    const [imageUrl, mobileImageUrl] = await Promise.all([
        saveFiles([image]).then(r => r[0]),
        mobileImage ? saveFiles([mobileImage]).then(r => r[0]) : Promise.resolve(null)
    ])

    try {
        await prisma.slider.create({
            data: {
                ...rest,
                image: imageUrl,
                mobileImage: mobileImageUrl
            }
        })
    }
    catch (error) {
        await deleteFiles([imageUrl, ...(mobileImageUrl ? [mobileImageUrl] : [])])
        throw error
    }
}

export async function updateSlider(id: string, data: UpdateSliderFormInput) {
    const { image, initialImage, mobileImage, initialMobileImage, ...rest } = data

    const slider = await prisma.slider.findUnique({ where: { id }, select: { image: true, mobileImage: true } })
    if (!slider) throw new AppError("Slider bulunamadı", 404)

    if (!image && !initialImage?.length) throw new AppError("Slider için görsel zorunludur", 400)

    const [savedImageUrl, mobileImageUrl] = await Promise.all([
        image
            ? saveFiles([image]).then(r => r[0])
            : Promise.resolve(null),
        mobileImage
            ? saveFiles([mobileImage]).then(r => r[0])
            : Promise.resolve(initialMobileImage?.length ? slider.mobileImage : null)
    ])

    try {
        await prisma.slider.update({
            where: { id },
            data: {
                ...rest,
                image: savedImageUrl ?? slider.image,
                mobileImage: mobileImageUrl
            }
        })
    }
    catch (error) {
        await deleteFiles([
            ...(savedImageUrl ? [savedImageUrl] : []),
            ...((mobileImage && mobileImageUrl) ? [mobileImageUrl] : [])
        ])
        throw error
    }

    await deleteFiles([
        ...(image ? [slider.image] : []),
        ...((slider.mobileImage && (mobileImage || !initialMobileImage?.length)) ? [slider.mobileImage] : [])
    ])
}

export async function deleteSlider(id: string) {
    try {
        const { image, mobileImage } = await prisma.slider.delete({
            where: { id },
            select: { image: true, mobileImage: true }
        })

        await deleteFiles([
            image,
            ...(mobileImage ? [mobileImage] : [])
        ])
    }
    catch (error) {
        if ((error as any)?.code === "P2025") throw new AppError("Slider bulunamadı", 404)
        throw error
    }
}

export async function getAdminSliders(): Promise<SliderAdminList[]> {
    return prisma.slider.findMany({
        select: sliderAdminListSelect,
        orderBy: [
            { isActive: "desc" },
            { sortOrder: "asc" }
        ]
    })
}

export async function getPublicSliders(): Promise<SliderPublic[]> {
    return prisma.slider.findMany({
        where: { isActive: true },
        select: sliderPublicSelect,
        orderBy: { sortOrder: "asc" }
    })
}