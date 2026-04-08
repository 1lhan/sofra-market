import { t } from "elysia"

export const createCategorySchema = t.Object({
    name: t.String({ minLength: 3, maxLength: 50 }),
    slug: t.String({ minLength: 3, maxLength: 50 }),
    sortOrder: t.Numeric({ minimum: 0 })
})

export const updateCategorySchema = createCategorySchema

export type CreateCategoryFormInput = typeof createCategorySchema.static
export type UpdateCategoryFormInput = typeof updateCategorySchema.static