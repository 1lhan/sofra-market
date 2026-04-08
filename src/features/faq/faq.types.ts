import { Prisma } from "@/generated/prisma/client"

export const faqAdminListSelect: Prisma.FaqSelect = {
    id: true,
    question: true,
    answer: true,
    sortOrder: true
}

export const faqPublicSelect: Prisma.FaqSelect = {
    question: true,
    answer: true
}

export type FaqAdminList = Prisma.FaqGetPayload<{ select: typeof faqAdminListSelect }>
export type FaqPublic = Prisma.FaqGetPayload<{ select: typeof faqPublicSelect }>