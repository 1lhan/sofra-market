import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/server/errors";
import { UpdateUserInformationsFormInput } from "./user.schema";

export async function updateUserInformations(data: UpdateUserInformationsFormInput, userId: string) {
    try {
        return await prisma.user.update({
            where: { id: userId },
            data,
            select: {
                email: true,
                firstName: true,
                lastName: true,
                phone: true
            }
        })
    }
    catch (error) {
        if ((error as any)?.code === "P2025") throw new AppError("Kullanıcı bulunamadı", 404)

        const constraint = (error as any)?.meta?.driverAdapterError?.cause?.constraint as Record<string, any>
        if (constraint?.fields?.includes("email")) throw new AppError("Bu e-posta zaten kullanılıyor", 400)

        throw error
    }
}