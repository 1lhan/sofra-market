import { Prisma } from "@/generated/prisma/client"

export const faqAdminListSelect = {
    id: true,
    question: true,
    answer: true,
    sortOrder: true
} satisfies Prisma.FaqSelect

export const faqPublicSelect = {
    question: true,
    answer: true
} satisfies Prisma.FaqSelect

export type FaqAdminList = Prisma.FaqGetPayload<{ select: typeof faqAdminListSelect }>
export type FaqPublic = Prisma.FaqGetPayload<{ select: typeof faqPublicSelect }>