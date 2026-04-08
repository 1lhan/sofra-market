import { CampaignType, DiscountType } from "@/generated/prisma/enums"
import { NullableDateTimeLocal, NullableDecimal, NullableInteger } from "@/lib/typebox"
import { t } from "elysia"

export const createCampaignSchema = t.Object({
    title: t.String({ minLength: 3, maxLength: 200 }),
    description: t.String({ minLength: 3, maxLength: 500 }),
    image: t.Transform(t.Files({ type: ["image/webp", "image/jpeg"], maxSize: "1024k", minItems: 0, maxItems: 1 }))
        .Decode(v => v.length === 0 ? null : v[0])
        .Encode(v => v === null ? [] : [v]),
    type: t.Enum(CampaignType),
    isActive: t.BooleanString(),
    startsAt: NullableDateTimeLocal,
    endsAt: NullableDateTimeLocal,
    discountType: t.Optional(
        t.Transform(
            t.Union([
                t.Enum(DiscountType),
                t.Literal("")
            ])
        )
            .Decode(v => v === "" ? null : v)
            .Encode(v => v === null ? "" : v)
    ),
    discountValue: t.Optional(NullableDecimal({ minimum: 1 })),
    maxDiscountAmount: t.Optional(NullableDecimal({ minimum: 1 })),
    minOrderAmount: t.Optional(NullableDecimal({ minimum: 1 })),
    buyQuantity: t.Optional(NullableInteger({ minimum: 1 })),
    payQuantity: t.Optional(NullableInteger({ minimum: 1 })),
    everyNth: t.Optional(NullableInteger({ minimum: 1 })),
    usageLimit: t.Optional(NullableInteger({ minimum: 1 })),
    perUserLimit: t.Optional(NullableInteger({ minimum: 1 })),
    products: t.Transform(
        t.Optional(
            t.Union([
                t.Array(t.String()),
                t.String()
            ])
        )
    )
        .Decode(v => {
            if (!v) return []
            if (typeof v === "string") return [v]
            return v
        })
        .Encode(v => v)
})

export const updateCampaignSchema = t.Composite([
    createCampaignSchema,
    t.Object({
        initialImage: t.Optional(t.Array(t.String(), { maxItems: 1 }))
    })
])

export type CreateCampaignFormInput = typeof createCampaignSchema.static
export type UpdateCampaignFormInput = typeof updateCampaignSchema.static