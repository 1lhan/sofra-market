import Elysia from "elysia";
import { createProductSchema, updateProductSchema } from "./product.schema";
import { createProduct, deleteProduct, getAdminProducts, getProductForUpdate, getProductOptions, getPublicProductDetail, getPublicProducts, updateProduct } from "./product.service";

export const adminProductRoutes = new Elysia({ prefix: "/admin/products" })
    // .onBeforeHandle(async () => {
    //     await authorizeUser(["ADMIN"])
    // })
    .get(
        "/",
        async ({ query }) => {
            const data = await getAdminProducts(query.page, 10)
            return { success: true, data }
        }
    )
    .post(
        "/",
        async ({ body }) => {
            await createProduct(body)
            return { success: true }
        },
        { body: createProductSchema }
    )
    .get(
        "/:id/edit",
        async ({ params: { id } }) => {
            const data = await getProductForUpdate(id)
            return { success: true, data }
        }
    )
    .put(
        "/:id",
        async ({ params: { id }, body }) => {
            await updateProduct(id, body)
            return { success: true }
        },
        { body: updateProductSchema }
    )
    .delete(
        "/:id",
        async ({ params: { id } }) => {
            const data = await deleteProduct(id)
            return { success: true, data }
        }
    )

export const publicProductRoutes = new Elysia({ prefix: "/products" })
    .get(
        "/",
        async () => {
            const data = await getPublicProducts()
            return { success: true, data }
        }
    )
    .get(
        "/:id",
        async ({ params: { id } }) => {
            const data = await getPublicProductDetail(id)
            return { success: true, data }
        }
    )
    .get(
        "/options",
        async () => {
            const data = await getProductOptions()
            return { success: true, data }
        }
    )