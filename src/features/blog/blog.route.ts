import { auth } from "@/lib/auth";
import { AppError } from "@/lib/server/errors";
import Elysia, { t } from "elysia";
import { headers } from "next/headers";
import { createBlogSchema, updateBlogSchema } from "./blog.schema";
import { createBlog, deleteBlog, getAdminBlogs, getBlogForUpdate, getPublicBlogs, updateBlog } from "./blog.service";

export const adminBlogRoutes = new Elysia({ prefix: "/admin/blogs" })
    .derive(async () => {
        const session = await auth.api.getSession({ headers: await headers() })
        if (!session?.user.roles.includes("ADMIN")) throw new AppError("UNAUTHORIZED", 401)
    })
    .get(
        "/",
        async ({ query }) => {
            const data = await getAdminBlogs(query.page, 10)
            return { success: true, data }
        },
        { query: t.Object({ page: t.Optional(t.Numeric()) }) }
    )
    .post(
        "/",
        async ({ body }) => {
            await createBlog(body)
            return { success: true }
        },
        { body: createBlogSchema }
    )
    .get(
        "/:id/edit",
        async ({ params: { id } }) => {
            const data = await getBlogForUpdate(id)
            return { success: true, data }
        }
    )
    .put(
        "/:id",
        async ({ params: { id }, body }) => {
            await updateBlog(id, body)
            return { success: true }
        },
        { body: updateBlogSchema }
    )
    .delete(
        "/:id",
        async ({ params: { id } }) => {
            await deleteBlog(id)
            return { success: true }
        }
    )

export const publicBlogRoutes = new Elysia({ prefix: "/blogs" })
    .get(
        "/",
        async ({ query }) => {
            const data = await getPublicBlogs(query.page, 10)
            return { success: true, data }
        },
        { query: t.Object({ page: t.Optional(t.Numeric()) }) }
    )