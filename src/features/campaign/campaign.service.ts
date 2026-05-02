import { CampaignType } from "@/generated/prisma/enums"
import { prisma } from "@/lib/prisma"
import { AppError } from "@/lib/server/errors"
import { deleteFiles, saveFiles } from "@/lib/server/storage"
import { cacheLife, cacheTag, revalidateTag } from "next/cache"
import { CreateCampaignFormInput, UpdateCampaignFormInput } from "./campaign.schema"
import { CampaignAdminList, campaignAdminListSelect, CampaignAdminUpdate, campaignAdminUpdateSelect, CampaignPublic, campaignPublicSelect } from "./campaign.types"

function validateCampaignFields(data: CreateCampaignFormInput | UpdateCampaignFormInput) {
    const { type, discountType, discountValue, buyQuantity, payQuantity, everyNth, minOrderAmount } = data

    switch (type) {
        case CampaignType.BUY_X_GET_Y:
            if (!buyQuantity || !payQuantity) throw new AppError("X Al Y Öde kampanyası için alım ve ödeme miktarı zorunludur", 400)
            if (buyQuantity <= payQuantity) throw new AppError("Alım miktarı ödeme miktarından büyük olmalıdır", 400)
            break
        case CampaignType.EVERY_NTH_DISCOUNT:
            if (!everyNth) throw new AppError("Her N. Ürüne İndirim kampanyası için N değeri zorunludur", 400)
            if (!discountType || !discountValue) throw new AppError("İndirim tipi ve değeri zorunludur", 400)
            break
        case CampaignType.BASKET_THRESHOLD:
            if (!minOrderAmount) throw new AppError("Sepet Tutarına Göre İndirim kampanyası için minimum sipariş tutarı zorunludur", 400)
            if (!discountType || !discountValue) throw new AppError("İndirim tipi ve değeri zorunludur", 400)
            break
        case CampaignType.GIFT_PRODUCT:
            if (!minOrderAmount) throw new AppError("Hediye Ürün kampanyası için minimum sipariş tutarı zorunludur", 400)
            break
    }
}

export async function createCampaign(data: CreateCampaignFormInput) {
    const { image, products = [], ...rest } = data

    validateCampaignFields(data)

    if (data.endsAt && new Date(data.endsAt) < new Date()) {
        throw new AppError("Bitiş tarihi geçmiş bir tarih olamaz", 400)
    }

    if (data.type === CampaignType.FREE_SHIPPING && data.isActive) {
        const activeFreeShippingCampaign = await prisma.campaign.findFirst({
            where: { type: CampaignType.FREE_SHIPPING, isActive: true },
            select: { id: true }
        })
        if (activeFreeShippingCampaign) throw new AppError("Zaten aktif bir ücretsiz kargo kampanyası var", 400)
    }

    const imageUrl = image ? (await saveFiles([image]))[0] : null

    try {
        await prisma.campaign.create({
            data: {
                ...rest,
                image: imageUrl,
                products: { connect: products.map(id => ({ id })) }
            }
        })
    }
    catch (error) {
        if (imageUrl) await deleteFiles([imageUrl])
        throw error
    }

    revalidateTag("campaigns", "max")
}

export async function updateCampaign(id: string, data: UpdateCampaignFormInput) {
    const { image, initialImage, products = [], ...rest } = data

    validateCampaignFields(data)

    if (data.endsAt && new Date(data.endsAt) < new Date()) {
        throw new AppError("Bitiş tarihi geçmiş bir tarih olamaz", 400)
    }

    const campaign = await prisma.campaign.findUnique({
        where: { id },
        select: {
            image: true,
            products: {
                select: { id: true, title: true }
            },
            orderDiscounts: {
                take: 1,
                select: { id: true }
            },
            usageCount: true
        }
    })
    if (!campaign) throw new AppError("Kampanya bulunamadı", 404)

    if (data.usageLimit !== null && data.usageLimit !== undefined && data.usageLimit < campaign.usageCount) {
        throw new AppError(`Kullanım limiti, mevcut kullanım sayısından (${campaign.usageCount}) az olamaz`, 400)
    }

    const hasOrders = campaign.orderDiscounts.length > 0

    if (data.type === CampaignType.FREE_SHIPPING && data.isActive) {
        const activeFreeShipping = await prisma.campaign.findFirst({
            where: { type: CampaignType.FREE_SHIPPING, isActive: true, id: { not: id } },
            select: { id: true }
        })
        if (activeFreeShipping) throw new AppError("Zaten aktif bir ücretsiz kargo kampanyası var", 400)
    }

    if (hasOrders) {
        const removedProducts = campaign.products.filter(p => !products.includes(p.id))

        if (removedProducts.length > 0) {
            const usedOrderItems = await prisma.orderItem.findMany({
                where: {
                    productId: { in: removedProducts.map(p => p.id) },
                    order: { discounts: { some: { campaignId: id } } }
                },
                select: { productId: true }
            })

            if (usedOrderItems.length > 0) {
                const usedProductIds = new Set(usedOrderItems.map(i => i.productId))
                const usedProductNames = removedProducts
                    .filter(p => usedProductIds.has(p.id))
                    .map(p => p.title)
                    .join(", ")
                throw new AppError(`Şu ürünler siparişlerde kullanıldığı için çıkarılamaz: ${usedProductNames}`, 400)
            }
        }
    }

    const newImageUrl = image ? (await saveFiles([image]))[0] : null

    try {
        await prisma.campaign.update({
            where: { id },
            data: {
                ...(hasOrders
                    ? {
                        title: data.title,
                        description: data.description,
                        isActive: data.isActive,
                        startsAt: data.startsAt,
                        endsAt: data.endsAt
                    }
                    : rest
                ),
                image: newImageUrl ?? (initialImage?.length ? campaign.image : null),
                products: { set: products.map(id => ({ id })) }
            }
        })
    }
    catch (error) {
        if (newImageUrl) await deleteFiles([newImageUrl])
        throw error
    }

    if (campaign.image && (image || !initialImage?.length)) await deleteFiles([campaign.image])

    revalidateTag("campaigns", "max")
}

export async function deleteCampaign(id: string) {
    try {
        const deleted = await prisma.campaign.delete({
            where: { id },
            select: { image: true }
        })
        if (deleted.image) await deleteFiles([deleted.image])
    }
    catch (error) {
        if ((error as any)?.code === "P2025") throw new AppError("Kampanya bulunamadı", 404)
        if ((error as any)?.cause?.originalCode === "23001") throw new AppError("Siparişlerde kullanılan kampanya silinemez", 400)
        throw error
    }

    revalidateTag("campaigns", "max")
}

export async function getAdminCampaigns(page: number | undefined, limit: number): Promise<{ total: number, data: CampaignAdminList[] }> {
    const pageNumber = Math.max(1, page ?? 1)
    const offset = (pageNumber - 1) * limit

    const [total, data] = await Promise.all([
        prisma.campaign.count(),
        prisma.campaign.findMany({
            select: campaignAdminListSelect,
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

export async function getCampaignForUpdate(id: string): Promise<CampaignAdminUpdate | null> {
    return prisma.campaign.findUnique({
        where: { id },
        select: campaignAdminUpdateSelect
    })
}

export async function getPublicCampaigns(): Promise<CampaignPublic[]> {
    const now = new Date()
    return prisma.campaign.findMany({
        where: {
            isActive: true,
            AND: [
                { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
                { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }
            ]
        },
        select: campaignPublicSelect,
        orderBy: { createdAt: "desc" }
    })
}

export async function getCampaignsForCartCalculation() {
    "use cache"
    cacheLife("max")
    cacheTag("campaigns")
    cacheTag("products")

    return prisma.campaign.findMany({
        where: { isActive: true },
        select: {
            title: true,
            type: true,
            startsAt: true,
            endsAt: true,
            discountType: true,
            discountValue: true,
            maxDiscountAmount: true,
            minOrderAmount: true,
            buyQuantity: true,
            payQuantity: true,
            everyNth: true,
            usageLimit: true,
            usageCount: true,
            perUserLimit: true,
            products: {
                select: {
                    id: true
                }
            }
        }
    })
}