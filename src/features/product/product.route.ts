import { auth } from "@/lib/auth";
import { AppError } from "@/lib/server/errors";
import Elysia from "elysia";
import { headers } from "next/headers";
import { createProductSchema, getProductsSchema, updateProductSchema } from "./product.schema";
import { createProduct, deleteProduct, getAdminProducts, getProductForUpdate, getPublicProducts, updateProduct } from "./product.service";

export const adminProductRoutes = new Elysia({ prefix: "/admin/products" })
    .derive(async () => {
        const session = await auth.api.getSession({ headers: await headers() })
        if (!session?.user.roles.includes("ADMIN")) throw new AppError("UNAUTHORIZED", 401)
    })
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
        async ({ query }) => {
            const data = await getPublicProducts(query, 20)
            return { success: true, data }
        },
        { query: getProductsSchema }
    )