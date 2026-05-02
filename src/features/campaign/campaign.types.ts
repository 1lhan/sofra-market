import { Prisma } from "@/generated/prisma/client"
import { getCampaignsForCartCalculation } from "./campaign.service"

export const campaignAdminListSelect = {
    id: true,
    title: true,
    image: true,
    type: true,
    isActive: true,
    startsAt: true,
    endsAt: true,
    usageLimit: true,
    usageCount: true,
    _count: {
        select: {
            products: true,
            orderDiscounts: true
        }
    }
} satisfies Prisma.CampaignSelect

export const campaignAdminUpdateSelect = {
    title: true,
    description: true,
    image: true,
    type: true,
    isActive: true,
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
    perUserLimit: true,
    products: {
        select: {
            id: true
        }
    },
    _count: {
        select: {
            orderDiscounts: true
        }
    }
} satisfies Prisma.CampaignSelect

export const campaignPublicSelect = {
    title: true,
    description: true,
    image: true
} satisfies Prisma.CampaignSelect

export type CampaignAdminList = Prisma.CampaignGetPayload<{ select: typeof campaignAdminListSelect }>
export type CampaignAdminUpdate = Prisma.CampaignGetPayload<{ select: typeof campaignAdminUpdateSelect }>
export type CampaignPublic = Prisma.CampaignGetPayload<{ select: typeof campaignPublicSelect }>

export type CampaignForCartCalculation = Awaited<ReturnType<typeof getCampaignsForCartCalculation>>[number]