import { t } from "elysia";

export const registerSchema = t.Object({
    email: t.String({ format: "email" }),
    firstName: t.String({ minLength: 2, maxLength: 50 }),
    lastName: t.String({ minLength: 2, maxLength: 50 }),
    password: t.String({ minLength: 8, maxLength: 40 }),
    passwordConfirm: t.String({ minLength: 8, maxLength: 40 })
})

export const loginSchema = t.Object({
    email: t.String({ format: "email" }),
    password: t.String({ minLength: 8, maxLength: 40 })
})

export type RegisterFormInput = typeof registerSchema.static
export type LoginFormInput = typeof loginSchema.static