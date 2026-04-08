import Elysia from "elysia";
import { createCategorySchema, updateCategorySchema } from "./category.schema";
import { createCategory, deleteCategory, getAdminCategories, getCategoryOptions, updateCategory } from "./category.service";

export const adminCategoryRoutes = new Elysia({ prefix: "/admin/categories" })
    // .onBeforeHandle(async () => {
    //     await authorizeUser(["ADMIN"])
    // })
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

export const publicCategoryRoutes = new Elysia({ prefix: "/categories" })
    .get(
        "/options",
        async () => {
            const data = await getCategoryOptions()
            return { success: true, data }
        }
    )