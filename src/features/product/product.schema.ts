import { NullableDecimal } from "@/lib/typebox"
import { t } from "elysia"

export const createProductSchema = t.Object({
    title: t.String({ minLength: 3, maxLength: 200 }),
    slug: t.String({ minLength: 3, maxLength: 200 }),
    excerpt: t.String({ minLength: 3, maxLength: 500 }),
    description: t.String(),
    descriptionImages: t.Optional(t.Files({ type: ["image/webp", "image/jpeg"], maxSize: "500k", minItems: 0, maxItems: 10 })),
    price: t.Numeric({ minimum: 1 }),
    comparePrice: NullableDecimal({ minimum: 1 }),
    stock: t.Numeric({ minimum: 0 }),
    images: t.Files({ type: ["image/webp", "image/jpeg"], maxSize: "500k", minItems: 0, maxItems: 4 }),
    isActive: t.BooleanString(),
    categoryId: t.String(),
    subcategoryId: t.Transform(t.String())
        .Decode(v => v === "" ? null : v)
        .Encode(v => v === null ? "" : v),
    metaTitle: t.Transform(t.String({ maxLength: 60 }))
        .Decode(v => v === "" ? null : v)
        .Encode(v => v === null ? "" : v),
    metaDescription: t.Transform(t.String({ maxLength: 200 }))
        .Decode(v => v === "" ? null : v)
        .Encode(v => v === null ? "" : v)
})

export const updateProductSchema = t.Composite([
    createProductSchema,
    t.Object({
        initialImages: t.Optional(t.Array(t.String(), { maxItems: 4 }))
    })
])

export type CreateProductFormInput = typeof createProductSchema.static
export type UpdateProductFormInput = typeof updateProductSchema.static