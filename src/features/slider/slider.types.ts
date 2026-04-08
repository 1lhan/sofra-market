import { Prisma } from "@/generated/prisma/client"

export const sliderAdminListSelect: Prisma.SliderSelect = {
    id: true,
    image: true,
    mobileImage: true,
    imageAlt: true,
    href: true,
    isActive: true,
    sortOrder: true
}

export const sliderPublicSelect: Prisma.SliderSelect = {
    image: true,
    mobileImage: true,
    imageAlt: true,
    href: true
}

export type SliderAdminList = Prisma.SliderGetPayload<{ select: typeof sliderAdminListSelect }>
export type SliderPublic = Prisma.SliderGetPayload<{ select: typeof sliderPublicSelect }>