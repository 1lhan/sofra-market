import { prisma } from "@/lib/prisma"
import { AppError } from "@/lib/server/errors"
import { CreateAddressFormInput, UpdateAddressFormInput } from "./address.schema"
import { UserAddress, UserAddressSelect } from "./address.types"

export async function createAddress(data: CreateAddressFormInput, userId: string) {
    const existingAddressCount = await prisma.address.count({
        where: { userId, isDeleted: false }
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
    const address = await prisma.address.findUnique({
        where: { id, userId, isDeleted: false },
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
    const hasChanges = fields.some(field => String(data[field] ?? null) !== String(address[field] ?? null))

    if (!hasChanges) return

    const hasOrders = address.shippingOrders.length > 0 || address.billingOrders.length > 0

    if (hasOrders) {
        await prisma.$transaction([
            prisma.address.update({
                where: { id },
                data: { isDeleted: true }
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
        where: { id, userId, isDeleted: false },
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
            data: { isDeleted: true }
        })
    }
    else {
        await prisma.address.delete({ where: { id } })
    }

    if (address.isDefault) {
        const nextAddress = await prisma.address.findFirst({
            where: { userId, isDeleted: false },
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
        where: { userId, isDeleted: false },
        select: UserAddressSelect,
        orderBy: [
            { isDefault: "desc" },
            { createdAt: "desc" }
        ]
    })
}