import { auth } from "@/lib/auth";
import { AppError } from "@/lib/server/errors";
import Elysia from "elysia";
import { headers } from "next/headers";
import { createSubcategorySchema, updateSubcategorySchema } from "./subcategory.schema";
import { createSubcategory, deleteSubcategory, getAdminSubcategories, updateSubcategory } from "./subcategory.service";

export const adminSubcategoryRoutes = new Elysia({ prefix: "/admin/subcategories" })
    .derive(async () => {
        const session = await auth.api.getSession({ headers: await headers() })
        if (!session?.user.roles.includes("ADMIN")) throw new AppError("UNAUTHORIZED", 401)
    })
    .get(
        "/",
        async () => {
            const data = await getAdminSubcategories()
            return { success: true, data }
        }
    )
    .post(
        "/",
        async ({ body }) => {
            await createSubcategory(body)
            return { success: true }
        },
        { body: createSubcategorySchema }
    )
    .put(
        "/:id",
        async ({ params: { id }, body }) => {
            await updateSubcategory(id, body)
            return { success: true }
        },
        { body: updateSubcategorySchema }
    )
    .delete(
        "/:id",
        async ({ params: { id } }) => {
            await deleteSubcategory(id)
            return { success: true }
        }
    )