import { auth } from "@/lib/auth";
import { AppError } from "@/lib/server/errors";
import Elysia from "elysia";
import { headers } from "next/headers";
import { createCategorySchema, updateCategorySchema } from "./category.schema";
import { createCategory, deleteCategory, getAdminCategories, updateCategory } from "./category.service";

export const adminCategoryRoutes = new Elysia({ prefix: "/admin/categories" })
    .derive(async () => {
        const session = await auth.api.getSession({ headers: await headers() })
        if (!session?.user.roles.includes("ADMIN")) throw new AppError("UNAUTHORIZED", 401)
    })
    .get(
        "/",
        async () => {
            const data = await getAdminCategories()
            return { success: true, data }
        }
    )
    .post(
        "/",
        async ({ body }) => {
            await createCategory(body)
            return { success: true }
        },
        { body: createCategorySchema }
    )
    .put(
        "/:id",
        async ({ params: { id }, body }) => {
            await updateCategory(id, body)
            return { success: true }
        },
        { body: updateCategorySchema }
    )
    .delete(
        "/:id",
        async ({ params: { id } }) => {
            await deleteCategory(id)
            return { success: true }
        }
    )