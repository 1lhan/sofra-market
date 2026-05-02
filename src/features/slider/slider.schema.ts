import { t } from "elysia"

const baseSliderSchema = t.Object({
    mobileImage: t.Optional(t.Transform(t.Files({ type: ["image/webp", "image/jpeg"], maxSize: "2000k", minItems: 0, maxItems: 1 }))
        .Decode(v => v.length === 0 ? null : v[0])
        .Encode(v => v === null ? [] : [v])),
    imageAlt: t.Transform(t.String({ maxLength: 125 }))
        .Decode(v => v === "" ? null : v)
        .Encode(v => v ?? ""),
    href: t.Transform(t.String({ maxLength: 500 }))
        .Decode(v => v === "" ? null : v)
        .Encode(v => v ?? ""),
    isActive: t.BooleanString(),
    sortOrder: t.Numeric({ minimum: 0 }),
})

export const createSliderSchema = t.Composite([
    baseSliderSchema,
    t.Object({
        image: t.File({ type: ["image/webp", "image/jpeg"], maxSize: "2000k" })
    })
])

export const updateSliderSchema = t.Composite([
    baseSliderSchema,
    t.Object({
        image: t.Optional(t.Transform(t.Files({ type: ["image/webp", "image/jpeg"], maxSize: "2000k", minItems: 0, maxItems: 1 }))
            .Decode(v => v.length === 0 ? null : v[0])
            .Encode(v => v === null ? [] : [v])),
        initialImage: t.Optional(
            t.Transform(
                t.Union([
                    t.String(),
                    t.Array(t.String())
                ])
            )
                .Decode(v => Array.isArray(v) ? v : [v])
                .Encode(v => v)
        ),
        initialMobileImage: t.Optional(
            t.Transform(
                t.Union([
                    t.String(),
                    t.Array(t.String())
                ])
            )
                .Decode(v => Array.isArray(v) ? v : [v])
                .Encode(v => v)
        )
    })
])

export type CreateSliderFormInput = typeof createSliderSchema.static
export type UpdateSliderFormInput = typeof updateSliderSchema.static