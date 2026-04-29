import { BillingType } from "@/generated/prisma/enums"
import { t } from "elysia"

export const createAddressSchema = t.Object({
    title: t.String({ minLength: 2, maxLength: 50 }),
    firstName: t.String({ minLength: 2, maxLength: 50 }),
    lastName: t.String({ minLength: 2, maxLength: 50 }),
    phone: t.String({ minLength: 10, maxLength: 15 }),
    city: t.String({ minLength: 2, maxLength: 50 }),
    district: t.String({ minLength: 2, maxLength: 50 }),
    neighborhood: t.String({ minLength: 2, maxLength: 150 }),
    addressLine: t.String({ minLength: 5, maxLength: 300 }),
    postalCode: t.Transform(
        t.String({ minLength: 5, maxLength: 5 })
    )
        .Decode(v => v === "" ? null : v)
        .Encode(v => v === null ? "" : v),
    billingType: t.Enum(BillingType),
    companyName: t.Optional(t.String({ minLength: 2, maxLength: 100 })),
    taxNumber: t.Optional(t.String({ minLength: 10, maxLength: 11 })),
    taxOffice: t.Optional(t.String({ minLength: 2, maxLength: 100 })),
    isEInvoice: t.Optional(t.BooleanString())
})

export const updateAddressSchema = createAddressSchema

export type CreateAddressFormInput = typeof createAddressSchema.static
export type UpdateAddressFormInput = typeof updateAddressSchema.static