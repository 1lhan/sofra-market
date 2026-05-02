import { auth } from "@/lib/auth"
import { AppError } from "@/lib/server/errors"
import Elysia from "elysia"
import { headers } from "next/headers"
import { updateUserInformationsSchema } from "./user.schema"
import { updateUserInformations } from "./user.service"

export const userRoutes = new Elysia({ prefix: "/users" })
    .derive(async () => {
        const session = await auth.api.getSession({ headers: await headers() })
        if (!session) throw new AppError("UNAUTHORIZED", 401)
        return { userId: session.user.id }
    })
    .put(
        "/",
        async ({ body, userId }) => {
            const data = await updateUserInformations(body, userId)
            return { success: true, data }
        },
        { body: updateUserInformationsSchema }
    )