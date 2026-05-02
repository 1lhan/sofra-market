import { prisma } from "@/lib/prisma"
import { AppError } from "@/lib/server/errors"
import { CreateAddressFormInput, UpdateAddressFormInput } from "./address.schema"
import { UserAddress, userAddressSelect } from "./address.types"

export async function createAddress(data: CreateAddressFormInput, userId: string) {
    if (data.billingType === "CORPORATE" && (!data.companyName || !data.taxNumber || !data.taxOffice)) {
        throw new AppError("Kurumsal adres için şirket adı, vergi numarası ve vergi dairesi zorunludur", 400)
    }

    const existingAddressCount = await prisma.address.count({
        where: { userId, deletedAt: null }
    })

    await prisma.address.create({
        data: {
            ...data,
            userId,
            isDefault: existingAddressCount === 0
        }
    })
}

export async function updateAddress(id: string, data: UpdateAddressFormInput, userId: string) {
    if (data.billingType === "CORPORATE" && (!data.companyName || !data.taxNumber || !data.taxOffice)) {
        throw new AppError("Kurumsal adres için şirket adı, vergi numarası ve vergi dairesi zorunludur", 400)
    }

    const address = await prisma.address.findUnique({
        where: { id, userId, deletedAt: null },
        select: {
            title: true,
            firstName: true,
            lastName: true,
            phone: true,
            city: true,
            district: true,
            neighborhood: true,
            addressLine: true,
            postalCode: true,
            billingType: true,
            isDefault: true,
            companyName: true,
            taxNumber: true,
            taxOffice: true,
            isEInvoice: true,
            shippingOrders: { take: 1, select: { id: true } },
            billingOrders: { take: 1, select: { id: true } }
        }
    })
    if (!address) throw new AppError("Adres bulunamadı", 404)

    const fields = ["title", "firstName", "lastName", "phone", "city", "district", "neighborhood", "addressLine", "postalCode", "billingType", "companyName", "taxNumber", "taxOffice", "isEInvoice"] as const
    const hasChanges = fields.some(field => JSON.stringify(data[field] ?? null) !== JSON.stringify(address[field] ?? null))

    if (!hasChanges) return

    const hasOrders = address.shippingOrders.length > 0 || address.billingOrders.length > 0

    if (hasOrders) {
        await prisma.$transaction([
            prisma.address.update({
                where: { id },
                data: { deletedAt: new Date() }
            }),
            prisma.address.create({
                data: {
                    ...data,
                    userId,
                    isDefault: address.isDefault
                }
            })
        ])
        return
    }

    await prisma.address.update({
        where: { id },
        data
    })
}

export async function deleteAddress(id: string, userId: string) {
    const address = await prisma.address.findUnique({
        where: { id, userId, deletedAt: null },
        select: {
            isDefault: true,
            shippingOrders: { take: 1, select: { id: true } },
            billingOrders: { take: 1, select: { id: true } }
        }
    })
    if (!address) throw new AppError("Adres bulunamadı", 404)

    const hasOrders = address.shippingOrders.length > 0 || address.billingOrders.length > 0

    if (hasOrders) {
        await prisma.address.update({
            where: { id },
            data: { deletedAt: new Date() }
        })
    }
    else {
        await prisma.address.delete({ where: { id } })
    }

    if (address.isDefault) {
        const nextAddress = await prisma.address.findFirst({
            where: { userId, deletedAt: null },
            select: { id: true },
            orderBy: { createdAt: "asc" }
        })
        if (nextAddress) {
            await prisma.address.update({
                where: { id: nextAddress.id },
                data: { isDefault: true }
            })
        }
    }
}

export async function getUserAddresses(userId: string): Promise<UserAddress[]> {
    return prisma.address.findMany({
        where: { userId, deletedAt: null },
        select: userAddressSelect,
        orderBy: [
            { isDefault: "desc" },
            { createdAt: "desc" }
        ]
    })
}

export async function setDefaultAddress(id: string, userId: string) {
    await prisma.$transaction([
        prisma.address.updateMany({
            where: { userId, deletedAt: null },
            data: { isDefault: false }
        }),
        prisma.address.update({
            where: { id, userId, deletedAt: null },
            data: { isDefault: true }
        })
    ])
        .catch((error) => {
            if ((error as any)?.code === "P2025") throw new AppError("Adres bulunamadı", 404)
            throw error
        })
}