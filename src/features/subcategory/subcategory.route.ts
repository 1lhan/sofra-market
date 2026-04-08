import Elysia from "elysia";
import { createSubcategorySchema, updateSubcategorySchema } from "./subcategory.schema";
import { createSubcategory, deleteSubcategory, getAdminSubcategories, updateSubcategory } from "./subcategory.service";

export const adminSubcategoryRoutes = new Elysia({ prefix: "/admin/subcategories" })
    // .onBeforeHandle(async () => {
    //     await authorizeUser(["ADMIN"])
    // })
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

export const publicSubcategoryRoutes = new Elysia({ prefix: "/subcategories" })