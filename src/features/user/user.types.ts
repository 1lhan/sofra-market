import { Prisma } from "@/generated/prisma/client"

export const userContextSelect = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    roles: true
}

export type UserContext = Prisma.UserGetPayload<{ select: typeof userContextSelect }>