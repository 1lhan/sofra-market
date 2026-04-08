import { t } from "elysia"

export const createSubcategorySchema = t.Object({
    name: t.String({ minLength: 3, maxLength: 50 }),
    slug: t.String({ minLength: 3, maxLength: 50 }),
    sortOrder: t.Numeric({ minimum: 0 }),
    categoryId: t.String()
})

export const updateSubcategorySchema = createSubcategorySchema

export type CreateSubcategoryFormInput = typeof createSubcategorySchema.static
export type UpdateSubcategoryFormInput = typeof updateSubcategorySchema.static