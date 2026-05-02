import { Prisma } from "@/generated/prisma/client"

export const sliderAdminListSelect = {
    id: true,
    image: true,
    mobileImage: true,
    imageAlt: true,
    href: true,
    isActive: true,
    sortOrder: true
} satisfies Prisma.SliderSelect

export const sliderPublicSelect = {
    image: true,
    mobileImage: true,
    imageAlt: true,
    href: true
} satisfies Prisma.SliderSelect

export type SliderAdminList = Prisma.SliderGetPayload<{ select: typeof sliderAdminListSelect }>
export type SliderPublic = Prisma.SliderGetPayload<{ select: typeof sliderPublicSelect }>