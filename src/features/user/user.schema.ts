import { t } from "elysia"

export const updateUserInformationsSchema = t.Object({
    firstName: t.String({ minLength: 2, maxLength: 50 }),
    lastName: t.String({ minLength: 2, maxLength: 50 }),
    email: t.String({ format: "email" }),
    phone: t.Transform(
        t.Union([
            t.Literal(""),
            t.String({ minLength: 10, maxLength: 11 })
        ])
    )
        .Decode(v => v === "" ? null : v)
        .Encode(v => v === null ? "" : v)
})

export type UpdateUserInformationsFormInput = typeof updateUserInformationsSchema.static