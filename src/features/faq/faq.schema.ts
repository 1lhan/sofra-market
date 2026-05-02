import { t } from "elysia"

export const createFaqSchema = t.Object({
    question: t.String({ minLength: 3, maxLength: 300 }),
    answer: t.String({ minLength: 3 }),
    answerImages: t.Optional(t.Files({ type: ["image/webp", "image/jpeg"], maxSize: "500k", minItems: 0, maxItems: 2 })),
    sortOrder: t.Numeric({ minimum: 0 })
})

export const updateFaqSchema = createFaqSchema

export type CreateFaqFormInput = typeof createFaqSchema.static
export type UpdateFaqFormInput = typeof updateFaqSchema.static