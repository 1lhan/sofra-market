import { prisma } from "@/lib/prisma"
import { AppError } from "@/lib/server/errors"
import { deleteFiles, saveFiles } from "@/lib/server/storage"
import { revalidateTag } from "next/cache"
import { CreateCouponFormInput, UpdateCouponFormInput } from "./coupon.schema"
import { CouponAdminList, couponAdminListSelect, CouponAdminUpdate, couponAdminUpdateSelect, CouponPublic, couponPublicSelect } from "./coupon.types"

export async function createCoupon(data: CreateCouponFormInput) {
    const { image, ...rest } = data

    if (data.endsAt && new Date(data.endsAt) < new Date()) {
        throw new AppError("Bitiş tarihi geçmiş bir tarih olamaz", 400)
    }

    const codeExists = await prisma.coupon.findFirst({
        where: { code: data.code, isActive: true },
        select: { id: true }
    })
    if (codeExists) throw new AppError("Bu kupon kodu zaten aktif olarak kullanımda", 400)

    const imageUrl = image ? (await saveFiles([image]))[0] : null

    try {
        await prisma.coupon.create({
            data: {
                ...rest,
                image: imageUrl
            }
        })
    }
    catch (error) {
        if (imageUrl) await deleteFiles([imageUrl])
        throw error
    }

    revalidateTag("coupons", "max")
}

export async function updateCoupon(id: string, data: UpdateCouponFormInput) {
    const { image, initialImage, ...rest } = data

    const coupon = await prisma.coupon.findUnique({
        where: { id },
        select: {
            image: true,
            orderDiscounts: {
                take: 1,
                select: { id: true }
            }
        }
    })
    if (!coupon) throw new AppError("Kupon bulunamadı", 404)

    const codeExists = await prisma.coupon.findFirst({
        where: { code: data.code, isActive: true, id: { not: id } },
        select: { id: true }
    })
    if (codeExists) throw new AppError("Bu kupon kodu zaten aktif olarak kullanımda", 400)

    const newImageUrl = image ? (await saveFiles([image]))[0] : null

    try {
        await prisma.coupon.update({
            where: { id },
            data: {
                ...(coupon.orderDiscounts.length > 0
                    ? {
                        title: data.title,
                        description: data.description,
                        isActive: data.isActive,
                        startsAt: data.startsAt,
                        endsAt: data.endsAt
                    }
                    : rest),
                image: newImageUrl ?? (initialImage?.length ? coupon.image : null)
            }
        })
    }
    catch (error) {
        if (newImageUrl) await deleteFiles([newImageUrl])
        throw error
    }

    if (coupon.image && (image || !initialImage?.length)) await deleteFiles([coupon.image])

    revalidateTag("coupons", "max")
}

export async function deleteCoupon(id: string) {
    try {
        await prisma.coupon.delete({ where: { id } })
    }
    catch (error) {
        if ((error as any)?.code === "P2025") throw new AppError("Kupon bulunamadı", 404)
        if ((error as any)?.cause?.originalCode === "23001") throw new AppError("Siparişlerde kullanılan kupon silinemez", 400)
        throw error
    }

    revalidateTag("coupons", "max")
}

export async function getAdminCoupons(page: number | undefined, limit: number): Promise<{ total: number, data: CouponAdminList[] }> {
    const pageNumber = Math.max(1, page ?? 1)
    const offset = (pageNumber - 1) * limit

    const [total, data] = await Promise.all([
        prisma.coupon.count(),
        prisma.coupon.findMany({
            select: couponAdminListSelect,
            skip: offset,
            take: limit,
            orderBy: [
                { isActive: "desc" },
                { createdAt: "desc" }
            ]
        })
    ])

    return { total, data }
}

export async function getCouponForUpdate(id: string): Promise<CouponAdminUpdate | null> {
    return prisma.coupon.findUnique({
        where: { id },
        select: couponAdminUpdateSelect
    })
}

export async function getPublicCoupons(): Promise<CouponPublic[]> {
    const now = new Date()
    return prisma.coupon.findMany({
        where: {
            isActive: true,
            AND: [
                { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
                { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }
            ]
        },
        select: couponPublicSelect,
        orderBy: { createdAt: "desc" }
    })
}