import { DiscountType } from "@/generated/prisma/enums"
import { NullableDateTimeLocal, NullableDecimal, NullableInteger } from "@/lib/typebox"
import { t } from "elysia"

export const createCouponSchema = t.Object({
    code: t.String({ minLength: 3, maxLength: 20 }),
    title: t.String({ minLength: 3, maxLength: 200 }),
    description: t.String({ minLength: 3, maxLength: 500 }),
    image: t.Transform(t.Files({ type: ["image/webp", "image/jpeg"], maxSize: "1024k", minItems: 0, maxItems: 1 }))
        .Decode(v => v.length === 0 ? null : v[0])
        .Encode(v => v === null ? [] : [v]),
    isActive: t.BooleanString(),
    startsAt: NullableDateTimeLocal,
    endsAt: NullableDateTimeLocal,
    discountType: t.Enum(DiscountType),
    discountValue: t.Numeric({ minimum: 1 }),
    maxDiscountAmount: NullableDecimal({ minimum: 1 }),
    minOrderAmount: NullableDecimal({ minimum: 1 }),
    usageLimit: NullableInteger({ minimum: 1 })
})

export const updateCouponSchema = t.Composite([
    createCouponSchema,
    t.Object({
        initialImage: t.Optional(t.Array(t.String(), { maxItems: 1 }))
    })
])

export type CreateCouponFormInput = typeof createCouponSchema.static
export type UpdateCouponFormInput = typeof updateCouponSchema.static