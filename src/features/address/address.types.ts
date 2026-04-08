import { Prisma } from "@/generated/prisma/client"

export const UserAddressSelect: Prisma.AddressSelect = {
    id: true,
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
    isEInvoice: true
}

export type UserAddress = Prisma.AddressGetPayload<{ select: typeof UserAddressSelect }>