import { t } from "elysia"

export const createBlogSchema = t.Object({
    title: t.String({ minLength: 3, maxLength: 200 }),
    slug: t.String({ minLength: 3, maxLength: 100 }),
    excerpt: t.String({ minLength: 3, maxLength: 750 }),
    content: t.String(),
    contentImages: t.Optional(t.Files({ type: ["image/webp", "image/jpeg"], maxSize: "300k", minItems: 0, maxItems: 10 })),
    image: t.Transform(t.Files({ type: ["image/webp", "image/jpeg"], maxSize: "500k", minItems: 0, maxItems: 1 }))
        .Decode(v => v.length === 0 ? null : v[0])
        .Encode(v => v === null ? [] : [v]),
    metaTitle: t.Transform(t.String({ maxLength: 60 }))
        .Decode(v => v === "" ? null : v)
        .Encode(v => v === null ? "" : v),
    metaDescription: t.Transform(t.String({ maxLength: 200 }))
        .Decode(v => v === "" ? null : v)
        .Encode(v => v === null ? "" : v),
    products: t.Optional(t.Array(t.String()))
})

export const updateBlogSchema = t.Composite([
    createBlogSchema,
    t.Object({
        initialImage: t.Optional(t.Array(t.String(), { maxItems: 1 }))
    })
])

export type CreateBlogFormInput = typeof createBlogSchema.static
export type UpdateBlogFormInput = typeof updateBlogSchema.static